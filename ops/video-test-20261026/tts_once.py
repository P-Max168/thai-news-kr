#!/usr/bin/env python3
"""Bounded one-off Gemini TTS. Never prints response bodies, keys, headers or URLs."""
import argparse, base64, hashlib, io, json, os, re, sys, time, urllib.error, urllib.request, wave
from pathlib import Path
MODEL = 'gemini-3.8-flash-tts'
VOICE = 'Kore'
STYLE = '한국어 여성 뉴스 앵커. 차분하고 명료하게 자연스러운 뉴스 낭독 속도로 읽는다. 숫자를 정확하게 읽고 과장이나 감탄을 넣지 않는다.'
ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/' + MODEL + ':generateContent'
MAX_OUTPUT_TOKENS = 3072
MAX_CALLS = 14
MAX_ESTIMATED_THB = 18.4
USD_THB = 33.7621  # supplied snapshot, not live FX
GUARD_USD_THB = 40.0  # conservative guard FX, separate from reported snapshot
RESERVATION_USD_PER_CALL = (MAX_OUTPUT_TOKENS*9 + 4000*.5)/1e6
class SafeError(Exception): pass
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs): raise SafeError('redirect_refused')
def request_payload(text):
    return {'contents':[{'role':'user','parts':[{'text':text,'speech_metadata':{'style':STYLE}}]}], 'generationConfig':{'responseModalities':['AUDIO'],'maxOutputTokens':MAX_OUTPUT_TOKENS,'speechConfig':{'voiceConfig':{'voice':VOICE}}}}
def call_api(text, key, opener=None):
    req=urllib.request.Request(ENDPOINT, data=json.dumps(request_payload(text),ensure_ascii=False).encode(), headers={'Content-Type':'application/json','x-goog-api-key':key}, method='POST')
    try:
        with (opener or urllib.request.build_opener(NoRedirect())).open(req,timeout=60) as res:
            raw=res.read(24*1024*1024+1)
        if len(raw)>24*1024*1024: raise SafeError('response_too_large')
        return json.loads(raw)
    except urllib.error.HTTPError as e: raise SafeError('http_'+str(e.code)) from None
    except SafeError: raise
    except Exception: raise SafeError('transport_or_json_error') from None

def safe_usage(response):
    src=response.get('usageMetadata',{})
    allowed=('promptTokenCount','candidatesTokenCount','totalTokenCount','thoughtsTokenCount','cachedContentTokenCount')
    return {k:src[k] for k in allowed if isinstance(src.get(k),int) and 0<=src[k]<=10**8}

def extract_wav(response):
    try:
        candidates=response['candidates']
        if len(candidates)!=1: raise SafeError('unexpected_candidate_count')
        c=candidates[0]
        if c.get('finishReason') not in (None,'STOP'): raise SafeError('generation_not_complete')
        audio=[p['inlineData'] for p in c['content']['parts'] if 'inlineData' in p]
        if len(audio)!=1: raise SafeError('unexpected_audio_parts')
        mime=audio[0]['mimeType'].lower()
        raw=base64.b64decode(audio[0]['data'],validate=True)
        if mime.split(';')[0] in ('audio/wav','audio/x-wav'):
            if not (raw[:4]==b'RIFF' and raw[8:12]==b'WAVE'): raise SafeError('invalid_wav_header')
            out=raw
        elif mime.split(';')[0] in ('audio/l16','audio/pcm'):
            if len(raw)%2: raise SafeError('odd_pcm_bytes')
            rate_match=re.search(r'(?:rate|samplerate)=(\d+)',mime)
            rate=int(rate_match.group(1)) if rate_match else 24000
            if rate!=24000: raise SafeError('unexpected_sample_rate')
            buf=io.BytesIO()
            with wave.open(buf,'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate); w.writeframes(raw)
            out=buf.getvalue()
        else: raise SafeError('unexpected_audio_mime')
        with wave.open(io.BytesIO(out),'rb') as w:
            channels,width,rate,frames=w.getnchannels(),w.getsampwidth(),w.getframerate(),w.getnframes()
            if (channels,width,rate)!=(1,2,24000): raise SafeError('unexpected_wav_format')
            duration=frames/rate
            if not 0.2<=duration<=180: raise SafeError('audio_duration_out_of_bounds')
            pcm=w.readframes(frames)
            if not any(pcm): raise SafeError('silent_audio')
        return out, {'duration_seconds':round(duration,6),'sample_rate':rate,'channels':channels,'sample_width':width,'bytes':len(out),'sha256':hashlib.sha256(out).hexdigest()}
    except SafeError: raise
    except Exception: raise SafeError('invalid_audio_response') from None

def validate_script(data):
    segs=data.get('segments',[])
    if len(segs)!=13 or segs[0].get('kind')!='opening' or segs[-1].get('kind')!='closing': raise SafeError('invalid_segment_structure')
    if len({s.get('id') for s in segs})!=13: raise SafeError('duplicate_segment_id')
    for s in segs:
        if not re.fullmatch(r'[a-zA-Z0-9_-]{1,40}',s.get('id','')): raise SafeError('unsafe_segment_id')
        if not isinstance(s.get('narration'),str) or not 1<=len(s['narration'])<=1200: raise SafeError('narration_size')
    if sum(len(s['narration']) for s in segs)>9000: raise SafeError('total_narration_size')
    return segs

def run(script, out, api=call_api):
    data=json.loads(Path(script).read_text()); segs=validate_script(data)
    # Fail before any API call if the whole fixed run would exceed approval.
    if (len(segs)+1)>MAX_CALLS: raise SafeError('request_count_guard')
    if (len(segs)+1)*RESERVATION_USD_PER_CALL*GUARD_USD_THB>MAX_ESTIMATED_THB: raise SafeError('preflight_budget_guard')
    key=os.environ.get('GEMINI_API_KEY','')
    if not key: raise SafeError('missing_api_key')
    out=Path(out); out.mkdir(parents=True,exist_ok=True)
    # No automatic resume or overwrite after any previous attempt.
    marker=out/'attempt_started.json'
    try:
        with marker.open('x') as f: json.dump({'model':MODEL,'voice':VOICE,'max_calls':MAX_CALLS},f)
    except FileExistsError: raise SafeError('previous_attempt_exists') from None
    started=time.monotonic(); records=[]
    jobs=[{'id':'calibration','narration':'시청자 여러분 안녕하십니까. 간추린 태국뉴스입니다. 태국 현지 주요 소식을 정확하고 차분하게 전해드립니다.'}]+segs
    report={'model':MODEL,'voice':VOICE,'request_limit':MAX_CALLS,'automatic_retries':0,'records':records,'billing_scope':'Gemini TTS only; script already generated in AI Studio; no new script API call','status':'running','max_estimated_thb':MAX_ESTIMATED_THB,'preflight_all_calls_upper_estimate_thb':round(MAX_CALLS*RESERVATION_USD_PER_CALL*GUARD_USD_THB,4),'preflight_snapshot_estimate_thb':round(MAX_CALLS*RESERVATION_USD_PER_CALL*USD_THB,4),'guard_usd_thb':GUARD_USD_THB,'price_as_of':'2026-10-26','fx_snapshot_time':'2026-10-26T07:02:31+07:00','usd_thb_snapshot':USD_THB,'attempted_calls':0}
    try:
        for i,s in enumerate(jobs):
            if time.monotonic()-started>720: raise SafeError('run_deadline')
            if (i+1)*RESERVATION_USD_PER_CALL*GUARD_USD_THB>MAX_ESTIMATED_THB: raise SafeError('estimated_budget_guard')
            report['attempted_calls']=i+1
            report['last_attempt_id']=s['id']
            report['last_attempt_usage']=None
            report['reserved_upper_estimate_thb']=round((i+1)*RESERVATION_USD_PER_CALL*GUARD_USD_THB,4)
            (out/'usage.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
            before=time.monotonic()
            response=api(s['narration'],key)
            # Keep only allowlisted numeric usage, never provider raw response.
            usage=safe_usage(response)
            report['last_attempt_usage']=usage
            (out/'usage.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
            wav,probe=extract_wav(response)
            if i==0 and probe['duration_seconds']>40: raise SafeError('calibration_too_long')
            path=out/(s['id']+'.wav'); path.write_bytes(wav)
            record={'id':s['id'],'input_characters':len(s['narration']),'elapsed_seconds':round(time.monotonic()-before,3),'usage':usage,'probe':probe}
            pt=usage.get('promptTokenCount'); ct=usage.get('candidatesTokenCount')
            record['estimated_paid_usd_from_usage']=round((pt*.5+ct*9)/1e6,8) if pt is not None and ct is not None else None
            records.append(record)
            (out/'usage.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
            print(json.dumps({'completed_segment':s['id'],'seconds':probe['duration_seconds']}),flush=True)
        report['status']='complete'
    except SafeError as e:
        report['status']='failed'; report['error_code']=str(e); raise
    finally:
        report['elapsed_seconds']=round(time.monotonic()-started,3)
        report['calls_succeeded']=len(records)
        report['episode_duration_seconds']=round(sum(r['probe']['duration_seconds'] for r in records if r['id']!='calibration'),6)
        report['estimated_paid_usd_from_usage']=round(sum(r['estimated_paid_usd_from_usage'] or 0 for r in records),8) if records and all(r['estimated_paid_usd_from_usage'] is not None for r in records) else None
        report['estimated_paid_thb_from_usage_at_snapshot']=round(report['estimated_paid_usd_from_usage']*USD_THB,8) if report['estimated_paid_usd_from_usage'] is not None else None
        report['actual_billed_usd']=None
        (out/'usage.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
    return report
if __name__=='__main__':
    a=argparse.ArgumentParser(); a.add_argument('--script',required=True); a.add_argument('--out',required=True); args=a.parse_args()
    try: run(args.script,args.out)
    except SafeError as e: print('TTS_STOPPED '+str(e),file=sys.stderr); sys.exit(1)
    except Exception: print('TTS_STOPPED local_validation_error',file=sys.stderr); sys.exit(1)
