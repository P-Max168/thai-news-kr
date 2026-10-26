import base64,io,json,os,tempfile,unittest,urllib.error,wave
from pathlib import Path
from unittest.mock import patch
import tts_once as m

def response():
 b=io.BytesIO()
 with wave.open(b,'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(24000);w.writeframes(b'\x01\x00'*24000)
 return {'candidates':[{'finishReason':'STOP','content':{'parts':[{'inlineData':{'mimeType':'audio/wav','data':base64.b64encode(b.getvalue()).decode()}}]}}], 'usageMetadata':{'promptTokenCount':30,'candidatesTokenCount':25,'totalTokenCount':55,'unsafe':'SECRET'}}
class Tests(unittest.TestCase):
 def test_budget_constants(self):
  self.assertEqual(m.MAX_CALLS,14);self.assertEqual(m.MAX_OUTPUT_TOKENS,3072)
  self.assertEqual(m.MAX_ESTIMATED_THB,18.4);self.assertEqual(m.GUARD_USD_THB,40)
  self.assertLessEqual(m.MAX_CALLS*m.RESERVATION_USD_PER_CALL*m.GUARD_USD_THB,18.4)
 def test_budget_preflight_no_api(self):
  with tempfile.TemporaryDirectory() as d, patch.object(m,'MAX_ESTIMATED_THB',1):
   seg=[{'id':str(i),'kind':'article','narration':'test'} for i in range(13)];seg[0]['kind']='opening';seg[-1]['kind']='closing';p=Path(d)/'s.json';p.write_text(json.dumps({'segments':seg}));count=[]
   def api(*a):count.append(1);return response()
   with self.assertRaisesRegex(m.SafeError,'preflight_budget_guard'):m.run(p,Path(d)/'o',api)
   self.assertEqual(count,[])
 def test_wav(self): self.assertEqual(m.extract_wav(response())[1]['duration_seconds'],1)
 def test_pcm(self):
  r=response();r['candidates'][0]['content']['parts'][0]['inlineData']={'mimeType':'audio/l16;rate=24000','data':base64.b64encode(b'\x01\x00'*24000).decode()};self.assertEqual(m.extract_wav(r)[1]['duration_seconds'],1)
 def test_usage(self):self.assertNotIn('unsafe',m.safe_usage(response()))
 def test_bad_mime(self):
  r=response();r['candidates'][0]['content']['parts'][0]['inlineData']['mimeType']='text/html'
  with self.assertRaisesRegex(m.SafeError,'unexpected_audio_mime'):m.extract_wav(r)
 def test_error_sanitized(self):
  class O:
   def open(self,*a,**k):raise urllib.error.HTTPError('https://SECRET',403,'SECRET',{},None)
  with self.assertRaisesRegex(m.SafeError,'^http_403$'):m.call_api('x','SECRET',O())
 def test_truncation_fails(self):
  r=response();r['candidates'][0]['finishReason']='MAX_TOKENS'
  with self.assertRaisesRegex(m.SafeError,'generation_not_complete'):m.extract_wav(r)
 def test_failure_stops(self):
  with tempfile.TemporaryDirectory() as d, patch.dict(os.environ,{'GEMINI_API_KEY':'SECRET'}):
   seg=[{'id':str(i),'kind':'article','narration':'test'} for i in range(13)];seg[0]['kind']='opening';seg[-1]['kind']='closing';p=Path(d)/'s.json';p.write_text(json.dumps({'segments':seg}));count=[]
   def fail(*a):count.append(1);raise m.SafeError('http_403')
   with self.assertRaises(m.SafeError):m.run(p,Path(d)/'o',fail)
   self.assertEqual(len(count),1);self.assertNotIn('SECRET',(Path(d)/'o/usage.json').read_text())
if __name__=='__main__':unittest.main()
