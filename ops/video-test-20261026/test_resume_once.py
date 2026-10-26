import unittest,tempfile,json,os
from pathlib import Path
from unittest.mock import patch
import resume_once as r
from test_tts_once import response
class Tests(unittest.TestCase):
 def test_budget(self):self.assertAlmostEqual(r.PRIOR_RESERVED_THB+r.ONE_CALL_RESERVED_THB,7.25402);self.assertLess(r.PRIOR_RESERVED_THB+r.ONE_CALL_RESERVED_THB,18.4)
 def test_audio(self):self.assertEqual(r.extract_remaining(response())[1]['duration_seconds'],1)
 def test_one_call_failure(self):
  with tempfile.TemporaryDirectory() as d,patch.dict(os.environ,{'GEMINI_API_KEY':'SECRET'}):
   p=Path(d)/'s.json';p.write_text(json.dumps({'segments':[{'id':i,'narration':'test'} for i in r.IDS]}));calls=[]
   def fail(*a):calls.append(1);raise r.t.SafeError('http_429 retry_after_seconds=40')
   with self.assertRaises(r.t.SafeError):r.run(p,Path(d)/'o',fail)
   self.assertEqual(calls,[1]);self.assertNotIn('SECRET',(Path(d)/'o/usage.json').read_text())
 def test_budget_no_call(self):
  with patch.object(r,'CAP_THB',1):
   with self.assertRaisesRegex(r.t.SafeError,'preflight_budget_guard'):r.run('nonexistent','unused')
if __name__=='__main__':unittest.main()
