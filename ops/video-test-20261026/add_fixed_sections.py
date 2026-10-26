"""Deterministic source-bound recap; no additional generation API call."""
import json,sys
from pathlib import Path
p=Path(sys.argv[1]); d=json.loads(p.read_text())
marker='fixed_sections_v1'
if marker not in d.get('review',{}):
    recap=['마지막으로 주요 소식 세 가지를 다시 짚어보겠습니다.', '첫째, 태국 경찰청과 이민국이 불법체류 외국인 1만여 명을 대상으로 전국 단속에 나섰다는 보도입니다.', '둘째, 홍수와 만조 관련 소식입니다. 재난예방완화국의 발표 시점과 각 지역의 경보 기간을 구분해 확인해야 합니다.', '셋째, 푸껫 빠통의 침수 소식입니다. 복구 전망은 추가 비가 내리지 않는다는 조건이 붙어 있습니다.']
    closing=d['segments'][-1]
    closing['narration']=' '.join(recap)+' '+closing['narration']
    closing['subtitles']=recap+closing['subtitles']
    if not isinstance(d.get('review'),dict): d['review']={'previous_review':d.get('review')}
    d['review'][marker]={'method':'deterministic fixed recap of selected first three articles','yesterday_fx_comparison':'omitted: no verified previous-day data','additional_script_api_calls':0,'tts_of_fixed_sections':'included in TTS cost, not free'}
    p.write_text(json.dumps(d,ensure_ascii=False,indent=2))
