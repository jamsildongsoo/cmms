import type { WPCategoryTemplate } from '@/types/workPermit';

export const WP_TEMPLATES: Record<string, WPCategoryTemplate> = {
    // [별지 제7호서식] 일반작업 허가서 — 항상 기본 포함
    GEN: {
        id: 'com',  // DB column: checksheet_json_com
        title: '일반작업 안전보건조치',
        questions: [
            { id: 'work_area_set', label: '작업구역 설정 (출입경고 표지)', type: 'checkbox' },
            { id: 'gas_check', label: '가스농도 측정', type: 'checkbox' },
            { id: 'equip_guard', label: '사용장비 방호조치', type: 'checkbox' },
            { id: 'fire_ext', label: '화기작업시 소화기 비치', type: 'checkbox' },
            { id: 'fire_remove', label: '화기작업시 인화물질 제거', type: 'checkbox' },
            { id: 'fire_blanket', label: '화기작업시 불꽃방지막 사용', type: 'checkbox' },
            { id: 'no_entry', label: '출입금지 조치', type: 'checkbox' },
            { id: 'power_off', label: '정전조치', type: 'checkbox' },
            { id: 'loto', label: '정전시 잠금 및 표지부착', type: 'checkbox' },
            { id: 'lighting', label: '조명장비', type: 'checkbox' },
            { id: 'ppe', label: '필요한 보호구 착용', type: 'checkbox' },
            { id: 'safety_edu', label: '안전교육', type: 'checkbox' },
            { id: 'op_presence', label: '운전요원의 입회', type: 'checkbox' },
        ],
        colorClass: 'border-slate-200 bg-slate-50/10'
    },
    // [별지 제1호서식] 화기작업 허가서
    HOT: {
        id: 'hot',  // DB column: checksheet_json_hot
        title: '화기작업 안전조치',
        questions: [
            { id: 'work_area_set', label: '작업구역 설정 (출입경고 표지)', type: 'checkbox' },
            { id: 'gas_check', label: '가스농도 측정', type: 'checkbox' },
            { id: 'valve_block', label: '밸브차단 및 차단표지부착', type: 'checkbox' },
            { id: 'nameplate', label: '명판설치 및 표지부착', type: 'checkbox' },
            { id: 'pressure_release', label: '용기개방 및 압력방출', type: 'checkbox' },
            { id: 'hazmat_release', label: '위험물질방출 및 처리', type: 'checkbox' },
            { id: 'vessel_clean', label: '용기내부 세정 및 처리', type: 'checkbox' },
            { id: 'inert_gas', label: '불활성가스 치환 및 환기', type: 'checkbox' },
            { id: 'fire_blanket', label: '비산불티차단막 설치', type: 'checkbox' },
            { id: 'loto', label: '정전/잠금/표지부착', type: 'checkbox' },
            { id: 'ventilation', label: '환기장비', type: 'checkbox' },
            { id: 'lighting', label: '조명장비', type: 'checkbox' },
            { id: 'fire_ext', label: '소화기', type: 'checkbox' },
            { id: 'safety_gear', label: '안전장구', type: 'checkbox' },
            { id: 'safety_edu', label: '안전교육', type: 'checkbox' },
            { id: 'op_presence', label: '운전요원의 입회', type: 'checkbox' },
            { id: 'explosion_proof', label: '방폭형 기기 또는 도구', type: 'checkbox' },
        ],
        colorClass: 'border-red-200 bg-red-50/10'
    },
    // [별지 제2호서식] 밀폐공간 출입작업 허가서
    CONF: {
        id: 'conf',  // DB column: checksheet_json_conf
        title: '밀폐공간 출입작업 안전조치',
        questions: [
            { id: 'valve_block', label: '밸브차단 및 차단표식부착', type: 'checkbox' },
            { id: 'gas_check', label: '가스농도 측정', type: 'checkbox' },
            { id: 'nameplate', label: '명판설치 및 표지부착', type: 'checkbox' },
            { id: 'pressure_release', label: '압력방출', type: 'checkbox' },
            { id: 'vessel_clean', label: '용기세정 후 공기/물 치환 및 환기', type: 'checkbox' },
            { id: 'o2_check', label: '산소농도 측정', type: 'checkbox' },
            { id: 'loto', label: '정전/잠금/표지부착', type: 'checkbox' },
            { id: 'ventilation', label: '환기장비', type: 'checkbox' },
            { id: 'lighting', label: '조명장비', type: 'checkbox' },
            { id: 'fire_ext', label: '소화기', type: 'checkbox' },
            { id: 'safety_gear', label: '안전장구 (구명선 등)', type: 'checkbox' },
            { id: 'safety_edu', label: '안전교육', type: 'checkbox' },
            { id: 'op_presence', label: '운전요원의 입회', type: 'checkbox' },
            { id: 'gas_hc', label: 'H·C (기준: 0%)', type: 'input', placeholder: '0%' },
            { id: 'gas_o2', label: 'O2 (기준: 18% 이상)', type: 'input', placeholder: '18% ~' },
            { id: 'gas_co', label: 'CO (기준: 25ppm 이하)', type: 'input', placeholder: '≤ 25ppm' },
            { id: 'gas_co2', label: 'CO2 (기준: 1.5% 미만)', type: 'input', placeholder: '< 1.5%' },
            { id: 'gas_h2s', label: 'H2S (기준: 10ppm 이하)', type: 'input', placeholder: '≤ 10ppm' },
        ],
        colorClass: 'border-blue-200 bg-blue-50/10'
    },
    // [별지 제3호서식] 정전작업 허가서
    ELEC: {
        id: 'elec',  // DB column: checksheet_json_elec
        title: '정전작업 안전조치',
        questions: [
            { id: 'main_sw_off', label: '[제어반] 주 차단 스위치 내림', type: 'checkbox' },
            { id: 'breaker_off', label: '[제어반] 제어차단기 내림', type: 'checkbox' },
            { id: 'lock_device', label: '[제어반] 잠금장치', type: 'checkbox' },
            { id: 'test_power_off', label: '[제어반] 시험전원 차단', type: 'checkbox' },
            { id: 'tag_out', label: '[제어반] 차단표지판 부착', type: 'checkbox' },
            { id: 'discharge', label: '[제어반] 잔류전하 방전', type: 'checkbox' },
            { id: 'voltage_check', label: '[제어반] 검전기로 충전여부 확인', type: 'checkbox' },
            { id: 'grounding', label: '[제어반] 단락접지기구 설치', type: 'checkbox' },
            { id: 'local_sw_off', label: '[현장기기] 현장스위치 내림', type: 'checkbox' },
            { id: 'local_tag_out', label: '[현장기기] 차단표지판 부착', type: 'checkbox' },
        ],
        colorClass: 'border-yellow-200 bg-yellow-50/10'
    },
    // [별지 제4호서식] 굴착작업 허가서
    DIG: {
        id: 'dig',  // DB column: checksheet_json_dig
        title: '굴착작업 안전조치',
        questions: [
            { id: 'pipe_check', label: '기계배관 관련: 지하배관 유무', type: 'checkbox' },
            { id: 'fire_pipe_check', label: '소방관련: 소방배관·배출구 유무', type: 'checkbox' },
            { id: 'power_cable_check', label: '전기관련: 전기동력선 유무', type: 'checkbox' },
            { id: 'control_cable_check', label: '계장관련: 제어용 케이블 유무', type: 'checkbox' },
            { id: 'etc_line_check', label: '기타관련: 전화선·접지선 유무', type: 'checkbox' },
        ],
        colorClass: 'border-amber-200 bg-amber-50/10'
    },
    // [별지 제5호서식] 고소작업 허가서
    HIGH: {
        id: 'high',  // DB column: checksheet_json_high
        title: '고소작업 안전조치',
        questions: [
            { id: 'scaffold_safety', label: '작업에 적합한 작업발판 및 안전난간설치 여부', type: 'checkbox' },
            { id: 'harness_helmet', label: '안전모, 안전대 착용 및 부착 여부', type: 'checkbox' },
            { id: 'safety_net', label: '추락 방지용 방망 설치 여부', type: 'checkbox' },
            { id: 'opening_measure', label: '개구부 조치', type: 'checkbox' },
        ],
        colorClass: 'border-green-200 bg-green-50/10'
    },
    // [별지 제6호서식] 중량물 취급 작업 허가서
    HEAVY: {
        id: 'heavy',  // DB column: checksheet_json_heavy (신규)
        title: '중량물 취급/중장비 작업 안전조치',
        questions: [
            { id: 'weather_cond', label: '기상상태 확인', type: 'checkbox' },
            { id: 'signal_man', label: '신호수 배치', type: 'checkbox' },
            { id: 'lighting', label: '조명설비', type: 'checkbox' },
            { id: 'no_traffic', label: '통행금지 표지판 부착', type: 'checkbox' },
            { id: 'power_line', label: '전원설비 간섭여부', type: 'checkbox' },
            { id: 'outrigger_mat', label: '매트 등 부속장구', type: 'checkbox' },
            { id: 'ground_cond', label: '노면상태', type: 'checkbox' },
            { id: 'work_plan', label: '작업계획서 작성', type: 'checkbox' },
            { id: 'license_check', label: '자격증 소지 여부', type: 'checkbox' },
        ],
        colorClass: 'border-purple-200 bg-purple-50/10'
    }
};
