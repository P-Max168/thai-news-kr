#!/usr/bin/env python3
"""Exactly one explicitly approved combined remaining narration request."""
import argparse, json, os, time, urllib.error, urllib.request
from pathlib import Path
from unittest.mock import patch
import tts_once as t
MAX_OUTPUT_TOKENS=6144
PRIOR_RESERVED_THB=4.96218
ONE_CALL_RESERVED_THB=(MAX_OUTPUT_TOKENS*9+4000*.5)/1e6*40
CAP_THB=18.4
IDS=['news09','news10','news11','closing']
def call_once(text,key):
    with patch.object(t,'MAX_OUTPUT_TOKENS',MAX_OUTPUT_TOKENS): payload=t.request_payload(text)
    req=urllib.request.Request(t.ENDPOINT,data=json.dumps(payload,ensure_ascii=False).encode(),headers={'Content-Type':'application/json','x-goog-api-key':key},method='POST')
    try:
        with urllib.request.build_opener(t.NoRedirect()).open(req,timeout=120) as res: raw=res.read(24*1024*1024+1)
        if len(raw)>24*1024*1024: raise t.SafeError('response_too_large')
        return json.loads(raw)
    except urllib.error.HTTPError as e:
        retry=e.headers.get('Retry-After','') if e.headers else ''
        suffix=(' retry_after_seconds='+retry) if retry.isdigit() and len(retry)<=6 else ''
        raise t.SafeError('http_'+str(e.code)+suffix) from None
    except t.SafeError: raise
    except Exception: raise t.SafeError('transport_or_json_error') from None
def extract_remaining(response):
    # Reuse strict decoder but independently validate longer approved audio range.
    import base64,io,wave,hashlib
    c=response.get('candidates',[])
    if len(c)!=1 or c[0].get('finishReason') not in (None,'STOP'): raise t.SafeError('generation_not_complete')
    parts=[p['inlineData'] for p in c[0].get('content',{}).get('parts',[]) if 'inlineData' in p]
    if len(parts)!=1: raise t.SafeError('unexpected_audio_parts')
    try:
        mime=parts[0]['mimeType'].lower(); raw=base64.b64decode(parts[0]['data'],validate=True)
        if mime.split(';')[0] in ('audio/wav','audio/x-wav'):
            if raw[:4]!=b'RIFF' or raw[8:12]!=b'WAVE': raise t.SafeError('invalid_wav_header')
            wav=raw
        elif mime.split(';')[0] in ('audio/l16','audio/pcm'):
            import re
            rate=re.search(r'(?:rate|samplerate)=(\d+)',mime)
            if len(raw)%2 or (rate and int(rate.group(1))!=24000): raise t.SafeError('invalid_pcm')
            b=io.BytesIO()
            with wave.open(b,'wb') as w: w.setnchannels(1);w.setsampwidth(2);w.setframerate(24000);w.writeframes(raw)
            wav=b.getvalue()
        else: raise t.SafeError('unexpected_audio_mime')
        with wave.open(io.BytesIO(wav),'rb') as w:
            if (w.getnchannels(),w.getsampwidth(),w.getframerate())!=(1,2,24000): raise t.SafeError('unexpected_wav_format')
            duration=w.getnframes()/24000
            if not .2<=duration<=246: raise t.SafeError('audio_duration_out_of_bounds')
            if not any(w.readframes(w.getnframes())): raise t.SafeError('silent_audio')
        return wav,{'duration_seconds':duration,'sample_rate':24000,'channels':1,'sample_width':2,'sha256':hashlib.sha256(wav).hexdigest()}
    except t.SafeError: raise
    except Exception: raise t.SafeError('invalid_audio_response') from None
def run(script,out,api=call_once):
    if PRIOR_RESERVED_THB+ONE_CALL_RESERVED_THB>CAP_THB: raise t.SafeError('preflight_budget_guard')
    data=json.loads(Path(script).read_text()); byid={s['id']:s for s in data['segments']}
    if not all(i in byid for i in IDS): raise t.SafeError('missing_remaining_segments')
    text='\n\n'.join(byid[i]['narration'] for i in IDS)
    if not 1<=len(text)<=1600: raise t.SafeError('remaining_text_size')
    key=os.environ.get('GEMINI_API_KEY','')
    if not key: raise t.SafeError('missing_api_key')
    out=Path(out);out.mkdir(parents=True,exist_ok=True)
    try: (out/'attempt_started').open('x').close()
    except FileExistsError: raise t.SafeError('previous_attempt_exists') from None
    report={'status':'running','model':t.MODEL,'voice':t.VOICE,'segment_ids':IDS,'attempted_calls':1,'automatic_retries':0,'max_output_tokens':MAX_OUTPUT_TOKENS,'guard_usd_thb':40,'prior_reserved_thb':PRIOR_RESERVED_THB,'this_call_reserved_thb':ONE_CALL_RESERVED_THB,'total_reserved_thb':PRIOR_RESERVED_THB+ONE_CALL_RESERVED_THB,'approved_cap_thb':CAP_THB,'input_characters':len(text),'actual_billed_usd':None}
    start=time.monotonic()
    try:
        (out/'usage.json').write_text(json.dumps(report,indent=2))
        response=api(text,key); report['usage']=t.safe_usage(response)
        wav,report['probe']=extract_remaining(response);(out/'remaining.wav').write_bytes(wav)
        report['status']='complete'
    except t.SafeError as e: report['status']='failed';report['error_code']=str(e);raise
    finally:
        u=report.get('usage',{});pt=u.get('promptTokenCount');ct=u.get('candidatesTokenCount')
        report['estimated_paid_usd_from_usage']=(pt*.5+ct*9)/1e6 if pt is not None and ct is not None else None
        report['elapsed_seconds']=round(time.monotonic()-start,3)
        (out/'usage.json').write_text(json.dumps(report,indent=2))
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--script',required=True);p.add_argument('--out',required=True);a=p.parse_args()
    try: run(a.script,a.out)
    except t.SafeError as e: print('TTS_STOPPED '+str(e));raise SystemExit(1)
    except Exception: print('TTS_STOPPED local_validation_error');raise SystemExit(1)
