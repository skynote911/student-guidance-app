/**
 * Guidance templates for student incidents
 * Focuses on 4-step guidance process and NEIS record generation
 */

export const GUIDANCE_TEMPLATES = {
    // 중학교: 일방적 괴롭힘, 폭력 대응
    'MIDDLE_BULLYING_VIOLENCE': {
        type: '학교폭력',
        subType: '일방적 괴롭힘/폭력',
        schoolLevel: 'middle',
        keywords: ['괴롭힘', '폭력', '일방적', '가해', '피해', '따돌림', '폭행', '신체적 위해', '인권 침해'],
        steps: [
            {
                step: 1,
                title: '사건 정리 및 누가기록 연계',
                icon: 'history',
                content: {
                    items: [],
                    highlights: [
                        '학생의 전반적인 문제 배경을 종합적으로 분석합니다.'
                    ]
                }
            },
            {
                step: 2,
                title: '학교폭력 구성 요건 분석 및 긴급 조치 판단',
                icon: 'gavel',
                content: {
                    items: [],
                    highlights: [
                        '학폭법 위반 여부 규범적 분석',
                        '인권 침해 여부 확인',
                        '폭력 금지 규범 위반 여부 검토'
                    ]
                }
            },
            {
                step: 3,
                title: '지도 및 개입 전략 실행',
                icon: 'psychology',
                content: {
                    items: [],
                    highlights: [
                        'AI는 맞춤형 개입 전략을 제시합니다.'
                    ]
                }
            },
            {
                step: 4,
                title: '데이터 관리 및 공식 기록 작성',
                icon: 'description',
                content: {
                    items: [],
                    highlights: [
                        'AI는 학교의 적절한 조치를 중심으로 문구를 생성하여 기록의 증거력을 높입니다.'
                    ]
                }
            }
        ],
        neisTemplate: (data) => {
            // 가해 학생과 피해 학생 구분
            const whoParts = data.who.split(',').map(s => s.trim());
            const perpetrator = whoParts.find(p => p.includes('가해')) || whoParts[0];
            const victim = whoParts.find(p => p.includes('피해')) || whoParts[1] || '피해 학생';

            // 기본 NEIS 기록 (통합)
            let record = `${data.date} ${data.where}에서 ${data.who} 간에 일방적 괴롭힘 및 폭력 사안이 발생함. 피해 학생 안전 확보 후 삼자 대면을 통한 사건 조사를 실시하고, AI 기록 도구를 활용하여 음성/텍스트 및 비언어적 증거를 객관적으로 확보함. 학교폭력 구성 요건(피해 사실, 가해 행위, 고의성, 지속성)을 분석한 결과, 학폭법 위반 및 인권 침해 사안으로 판단되어 즉시 분리 조치 및 보호자 통보를 실시함. 가해 학생에게는 폭력의 심각성과 인권 침해에 대한 책임 인식 교육을 실시하고, 피해 학생에게는 심리적 지원 및 전문가 상담 연계를 제공함. 학폭위 절차 안내 및 재발 방지를 위한 지속적인 상담 및 관찰을 실시하기로 함.`;

            // 누가기록 별도 생성 안내 (5단계)
            record += ` [누가기록] 가해 학생: "${data.date} ${victim}에게 지속적인 무시성 발언 및 신체적 위해를 가한 사실이 확인됨. 피해 학생 즉시 분리 조치 및 보호자 통보함. 사안의 중대성 교육과 관련하여 지속적 지도할 예정임." 피해 학생: "${data.date} 또래 학생으로부터 지속적인 정서적/신체적 괴롭힘을 당한 사실이 확인되어, wee클래스 전문 상담 및 심리 지원에 연계함. 현재 안전한 교육 환경 조성을 위해 학교가 노력하고 있으며, 학생은 회복에 집중하는 중."`;

            return record;
        }
    },

    'MIDDLE_EMOTIONAL_CRISIS': {
        type: '정서 위기',
        subType: '우울/정서적 위축',
        schoolLevel: 'middle',
        keywords: ['우울', '정서', '위기', '자해', '자살', '따돌림', '관계 어려움', '위축', '혼자', '외로움', '정서적 따돌림', '정서적 괴롭힘'],
        steps: [
            {
                step: 1,
                title: '상황 입력 및 초기 안전 확보',
                icon: 'healing',
                content: {
                    sections: [
                        {
                            title: '초기 안전 확보',
                            icon: 'security',
                            items: [
                                '학생을 심리적으로 안전한 공간으로 분리',
                                '면담 진행'
                            ]
                        },
                        {
                            title: '기록 준비',
                            icon: 'record_voice_over',
                            items: [
                                'AI 기록 도구 사용 및 녹취 동의 명확히 고지',
                                '학생의 진술("혼자 겉도는 느낌", "친구와 싸움" 등)을 음성/텍스트로 전체 녹음'
                            ]
                        },
                        {
                            title: '비언어적 기록',
                            icon: 'visibility',
                            items: [
                                '태도',
                                '위축 정도',
                                '눈물 유무',
                                '목소리 떨림'
                            ]
                        },
                        {
                            title: '육하원칙 보완',
                            icon: 'edit',
                            text: '일시, 장소 등 미흡한 부분을 보완합니다.'
                        }
                    ]
                }
            },
            {
                step: 2,
                title: '사건 정리 및 데이터 연계',
                icon: 'link',
                content: {
                    items: [],
                    sections: [
                        {
                            title: '연계 확인 사항',
                            icon: 'link',
                            items: [
                                '관련 학생들의 누가기록',
                                '상담 기록',
                                '심리검사 결과'
                            ]
                        }
                    ],
                    highlights: [
                        '학생의 전반적인 취약성을 종합적으로 분석합니다.'
                    ]
                }
            },
            {
                step: 3,
                title: '심층 위기 분석 및 문제 본질 구분',
                icon: 'psychology',
                content: {
                    sections: [
                        {
                            title: '위험도 3단계 분류',
                            icon: 'assessment',
                            items: [
                                '자해/자살 위험도',
                                '환경적 스트레스 요인',
                                '우울 지표'
                            ]
                        },
                        {
                            title: '문제 본질 구분',
                            icon: 'psychology',
                            items: [
                                '단순 갈등(관계 기술 부족)',
                                '학폭 사안으로 확대될 가능성(정서적 따돌림)'
                            ],
                            text: '가해 의도성, 반복성, 집단성을 기준으로 명확히 구분합니다.'
                        }
                    ],
                    highlights: [
                        '학폭법 위반 여부 규범적 분석',
                        '인권 침해 여부 확인',
                        '따돌림 금지 규범 위반 여부 검토'
                    ]
                }
            },
            {
                step: 4,
                title: '지도 및 개입 전략 실행',
                icon: 'support',
                content: {
                    sections: [
                        {
                            title: '즉각적 상담 및 정서 지원',
                            icon: 'support',
                            items: [
                                '학생의 상황을 기반으로 공감 방안 제시',
                                '감정 안정화 및 부정적 생각 전환을 위한 정서 조절 기술 훈련 초안 제시',
                                'wee클래스, 지역 아동 상담 센터 등 전문가 상담 연계 방안 제공',
                                '상담 요청 핵심 내용 초안 제공'
                            ]
                        },
                        {
                            title: '관계 회복 환경 조성',
                            icon: 'groups',
                            items: [
                                '새로운 관계 형성을 위한 구조화된 활동 제시',
                                '점심 시간 소규모 보드게임 활동',
                                '같은 취미를 가진 동아리 추천'
                            ],
                            text: '또래 관계 형성을 지원합니다.'
                        }
                    ],
                    highlights: [
                        '학생의 정서 안정화와 자발적인 관계 회복을 위한 단계적 전략을 제시합니다.'
                    ]
                }
            },
            {
                step: 5,
                title: '데이터 관리 및 공식 기록 작성',
                icon: 'description',
                content: {
                    items: [
                        '개인정보 보호 및 사안 관련 정보의 비공개 원칙 명시',
                        '상황에 대한 누가기록 작성',
                        'NEIS 연계 문구 생성'
                    ],
                    sections: [
                        {
                            title: '기록 작성 원칙',
                            icon: 'description',
                            items: [
                                '학생의 성장을 강조하는 문구 사용',
                                '행발 기록의 긍정적 측면 부각',
                                '학생의 노력과 성장 과정 강조'
                            ]
                        }
                    ],
                    highlights: [
                        'AI는 학생의 노력과 성장의 과정을 강조하는 문구를 생성하여 행발 기록의 질을 높입니다.'
                    ]
                }
            }
        ],
        neisTemplate: (data) => {
            const studentName = data.who.split('(')[0].trim() || '학생';
            return `${data.date} ${data.where}에서 ${studentName}이 또래 관계의 어려움으로 정서적 위축을 경험하였으나, 전문가의 심층 상담을 통해 자기 이해를 높이고 자발적으로 새로운 학습 공동체에 참여하는 등 긍정적 변화를 위해 꾸준히 노력하는 모습을 보였음.`;
        }
    },
    // 중학교: 수업 방해 및 교권침해 대응
    'MIDDLE_CLASSROOM_DISRUPTION': {
        type: '교권침해',
        subType: '수업 방해',
        schoolLevel: 'middle',
        keywords: ['수업 방해', '교권', '교권침해', '수업 통제', '모욕', '무시', '관심 끌기', '장난', '재밌어서', '불손', '책임 회피'],
        steps: [
            {
                step: 1,
                title: '상황 입력 및 증거 확보',
                icon: 'record_voice_over',
                content: {
                    sections: [
                        {
                            title: '면담 준비',
                            icon: 'person',
                            items: [
                                '학생을 개별 면담 공간으로 분리',
                                '면담 시작'
                            ]
                        },
                        {
                            title: '기록 준비',
                            icon: 'record_voice_over',
                            items: [
                                'AI 기록 도구 사용 및 녹취 동의 명확히 고지',
                                '학생의 진술("재밌어서요", "장난이에요" 등)을 음성/텍스트로 전체 녹음'
                            ]
                        },
                        {
                            title: '비언어적 기록',
                            icon: 'visibility',
                            items: [
                                '학생 태도(일시, 장소, 위축 정도, 목소리 떨림 등)',
                                '비언어적 부분 기록'
                            ]
                        },
                        {
                            title: '교사 피해 경험 기록',
                            icon: 'edit',
                            items: [
                                '교사의 직접적인 피해 경험 및 감정(수업 통제 실패, 모욕감 등)',
                                '텍스트로 보완하여 기록'
                            ]
                        }
                    ]
                }
            },
            {
                step: 2,
                title: '사건 정리 및 데이터 연계',
                icon: 'link',
                content: {
                    items: [],
                    sections: [
                        {
                            title: '연계 확인 사항',
                            icon: 'link',
                            items: [
                                '해당 학생의 누가기록',
                                '상담 기록',
                                '심리검사 결과'
                            ]
                        }
                    ],
                    highlights: [
                        '학생의 행동 배경을 심층적으로 분석합니다.'
                    ]
                }
            },
            {
                step: 3,
                title: '교권침해 분석 및 심층 문제 분석',
                icon: 'gavel',
                content: {
                    sections: [
                        {
                            title: '교권침해 분석',
                            icon: 'gavel',
                            items: [
                                '교권침해 행위의 유형 분석',
                                '교권침해 행위의 경중 분석',
                                '교사에게 분석 결과 고지'
                            ]
                        },
                        {
                            title: '학생 행동 배경 심층 분석',
                            icon: 'psychology',
                            items: [
                                '관심 끌기 욕구',
                                '낮은 자존감 방어',
                                '가정 내 권위 갈등 반영'
                            ],
                            text: '단순 징계가 아닌 맞춤형 상담의 근거를 마련합니다.'
                        }
                    ],
                    highlights: [
                        '수업 질서 및 학습권 침해 여부 분석',
                        '공동체 질서 유지 규범 위반 여부 검토',
                        '교권침해 규범 위반 여부 확인'
                    ]
                }
            },
            {
                step: 4,
                title: '지도 및 개입 전략 실행',
                icon: 'shield',
                content: {
                    sections: [
                        {
                            title: '현장 지도 및 교사 보호',
                            icon: 'shield',
                            items: [
                                '다른 학생의 학습권 보호',
                                '교사의 지도권 확보',
                                '즉시 수업 복귀 제한 조치',
                                '대체 학습 공간 마련 방안 제시'
                            ]
                        },
                        {
                            title: '대화 스크립트 및 행동 강화',
                            icon: 'psychology',
                            items: [
                                '학생의 상황과 누가기록을 바탕으로 감정을 배제하고 문제 행동에만 초점을 맞추는 대화 스크립트 초안 제공',
                                '긍정적 행동 강화 방법 제시',
                                '학생의 특성에 맞는 보상 스케줄(토큰 경제 등) 초안 제시'
                            ]
                        },
                        {
                            title: '학부모 대응',
                            icon: 'groups',
                            items: [
                                '학생의 행동에 대한 고지',
                                '교권 침해 무관용 원칙 설명',
                                '학부모 연락 양식 및 면담 초안 지원'
                            ]
                        },
                        {
                            title: '교권보호위원회',
                            icon: 'gavel',
                            text: '사안의 경중에 따라 교권보호위원회 소집 필요성에 대한 판단 근거를 제시합니다.'
                        }
                    ],
                    highlights: [
                        '교사의 보호를 최우선으로, 학생의 책임감 인지와 관계 회복을 위한 구체적인 전략을 제시합니다.'
                    ]
                }
            },
            {
                step: 5,
                title: '데이터 관리 및 공식 기록 작성',
                icon: 'description',
                content: {
                    items: [
                        '개인정보 보호 및 사안 관련 정보의 비공개 원칙 명시',
                        '상황에 대한 누가기록 작성',
                        'NEIS 기록 생성'
                    ],
                    sections: [
                        {
                            title: '기록 작성 원칙',
                            icon: 'description',
                            items: [
                                '기록의 공정성 확보',
                                '성장 중심의 기록 작성',
                                '학생의 노력과 긍정적인 관계 재정립 강조'
                            ]
                        }
                    ],
                    highlights: [
                        'AI는 학생의 노력과 긍정적인 관계 재정립을 강조하는 문구를 생성하여 행발 기록의 질을 높입니다.'
                    ]
                }
            }
        ],
        neisTemplate: (data) => {
            const studentName = data.who.split('(')[0].trim() || '학생';
            return `${data.date} 수업 중 관심 끌기 행동으로 지도받았으나, 교사와의 정기적인 면담을 통해 스스로 행동의 변화를 다짐하고 협력적인 과제 활동에 적극 참여하며 긍정적 관계를 형성해 나감.`;
        }
    },
    // 고등학교: 교내 흡연 의심 대응
    'HIGH_SMOKING_SUSPICION': {
        type: '흡연 의심',
        subType: '교내 흡연 의심',
        schoolLevel: 'high',
        keywords: ['흡연', '담배', '화장실', '흡연 의심', '흡연물', '금연', '흡연 친구', '흡연 관여', '흡연 유혹'],
        steps: [
            {
                step: 1,
                title: '상황 입력 및 증거 확보',
                icon: 'record_voice_over',
                content: {
                    sections: [
                        {
                            title: '초기 안전 확보',
                            icon: 'security',
                            items: [
                                '학생 안전 확보 및 녹취 고지',
                                '두 학생을 안전하게 생활지도실로 안내',
                                '녹취 동의 안내 및 고지 절차 진행'
                            ]
                        },
                        {
                            title: '진술 기록',
                            icon: 'record_voice_over',
                            items: [
                                '교사 유도에 따라 학생들의 진술(A: B가 피웠을 것, B: 부인)을 녹음',
                                '녹음 후 상황(장소, 시간, 흡연 의심 상황)을 텍스트로 입력하여 사실 기록'
                            ]
                        },
                        {
                            title: '비언어적 단서 기록',
                            icon: 'visibility',
                            items: [
                                '학생들의 면담 태도',
                                '눈 맞춤 회피',
                                '목소리 떨림'
                            ],
                            text: '추후 진술의 신뢰도 판단 자료로 활용합니다.'
                        }
                    ],
                    highlights: [
                        '초기 진술과 상황 정보를 객관적으로 기록합니다.'
                    ]
                }
            },
            {
                step: 2,
                title: '사건 정리 및 구조화',
                icon: 'link',
                content: {
                    items: [],
                    sections: [
                        {
                            title: '과거 기록 확인',
                            icon: 'link',
                            items: [
                                'B학생의 과거 누가기록 확인',
                                '"지난달에도 흡연 친구와 동행으로 지도받은 전력 있음" 확인',
                                '흡연 관여 가능성 표시'
                            ]
                        }
                    ],
                    highlights: [
                        '심층 조사의 근거를 제시합니다.'
                    ]
                }
            },
            {
                step: 3,
                title: '심층 문제 분석 및 규범 분석',
                icon: 'gavel',
                content: {
                    sections: [
                        {
                            title: '규범 분석',
                            icon: 'gavel',
                            items: [
                                '흡연 금지 조항 위반 가능성 명시',
                                '흡연물 소지 금지 조항 위반 가능성 명시',
                                '후속 조치에 필요한 법적 근거 제시'
                            ]
                        },
                        {
                            title: '추가 조사 활동',
                            icon: 'search',
                            items: [
                                '주변 학생 진술 확인',
                                'CCTV 확인',
                                '소지품 검사'
                            ],
                            text: '사실관계를 명확히 하기 위한 추가적인 조사 활동의 필요성을 제시합니다.'
                        }
                    ]
                }
            },
            {
                step: 4,
                title: '지도 방안 실행',
                icon: 'smoking_rooms',
                content: {
                    sections: [
                        {
                            title: '조사 및 확인 강화',
                            icon: 'search',
                            items: [
                                '담임 및 생활안전부 협조 요청',
                                '소지품 검사 등 학교 규정에 따른 조치',
                                '사실관계를 명확히 할 절차 제시'
                            ]
                        },
                        {
                            title: '실제 흡연 확인 시',
                            icon: 'smoking_rooms',
                            items: [
                                '금연서약서 작성',
                                '보건교사에게 즉시 연계하여 전문적인 금연 교육 및 상담 시작',
                                '학교 봉사, 특별 교육 등 후속 징계 절차 안내'
                            ]
                        },
                        {
                            title: '예방 및 소그룹 지도',
                            icon: 'groups',
                            items: [
                                'A학생을 포함하여 흡연 유혹 대처법 교육',
                                '친구의 권유 거절법 교육',
                                '소그룹 교육을 진행하여 예방 교육 강화'
                            ]
                        }
                    ],
                    highlights: [
                        '사실관계를 명확히 밝히는 절차를 제시하고, 흡연 여부와 관계없이 재발 방지 교육을 진행합니다.'
                    ]
                }
            },
            {
                step: 5,
                title: '데이터 관리 및 NEIS 연계',
                icon: 'description',
                content: {
                    items: [
                        '학교의 지도 노력과 학생의 태도를 기록',
                        'NEIS 문구에 사실과 반성을 명확히 담아냄',
                        '지도 내용이 학생들의 개별 데이터로 자동 누적'
                    ],
                    sections: [
                        {
                            title: '누가기록 생성',
                            icon: 'description',
                            items: [
                                '의심 상황 연루 사실',
                                '학교의 지도 내용',
                                '학생의 태도'
                            ]
                        },
                        {
                            title: '데이터 활용',
                            icon: 'analytics',
                            text: '추후 행동 변화 추이 분석 자료로 활용됩니다.'
                        }
                    ],
                    highlights: [
                        'AI는 의심 상황 연루 사실, 학교의 지도, 학생의 태도를 포함한 누가기록 문구를 생성하여 제안합니다.'
                    ]
                }
            }
        ],
        neisTemplate: (data) => {
            // A학생(신고자)과 B학생(의심 대상) 구분
            const whoParts = data.who.split(',').map(s => s.trim());
            const reporter = whoParts.find(p => p.includes('신고') || p.includes('A')) || whoParts[0];
            const suspect = whoParts.find(p => p.includes('의심') || p.includes('B')) || whoParts[1] || '학생';

            // B학생(의심 대상) NEIS 기록
            let record = `[B학생 누가기록] ${suspect}은(는) ${data.date} ${data.where}에서 흡연 관련 상황에 연루되어 교사의 지도를 받았으며, 본인은 흡연 사실을 부인하였으나, 평소 교우 관계 및 생활 습관을 돌아보며 반성하는 태도를 보임. 보건교사 연계 금연 예방 교육 이수 예정임.`;

            // A학생(신고자) NEIS 기록
            record += ` [A학생 누가기록] ${reporter}은(는) 흡연 의심 상황을 인지하고 교사에게 신고하여 학교의 질서 유지에 기여하였으며, 흡연 예방 교육에 적극적으로 참여함.`;

            return record;
        }
    },
    // 고등학교: 출결 문제 지속 대응
    'HIGH_ATTENDANCE_ISSUE': {
        type: '출결 문제',
        subType: '지속적 지각/결석',
        schoolLevel: 'high',
        keywords: ['출결', '지각', '결석', '무단지각', '무단결석', '출석', '등교', '아침', '일어나기', '학교 재미없어', '학습 동기', '출결 문제'],
        steps: [
            {
                step: 1,
                title: '상황 입력 및 증거 확보',
                icon: 'event_note',
                content: {
                    sections: [
                        {
                            title: '문제 행동 기록',
                            icon: 'event_note',
                            items: [
                                '누적된 문제 행동을 정확히 기록',
                                '학생의 초기 진술을 확보하여 문제의 배경 파악'
                            ]
                        },
                        {
                            title: '사실 기록',
                            icon: 'edit',
                            items: [
                                '텍스트 입력 기능을 활용하여 사실(횟수, 기간)을 기록',
                                '예: "C학생, 11월 1~12일 기간 중 무단지각 3회, 무단결석 2회 발생. 사전 연락 없음."'
                            ]
                        },
                        {
                            title: '면담 및 진술 기록',
                            icon: 'record_voice_over',
                            items: [
                                '담임교사가 C학생을 면담하여 무단 결석/지각의 이유를 듣고 기록',
                                '텍스트 입력 또는 음성 녹음으로 기록',
                                '학생의 진술("아침에 일어나기 힘들어요.", "학교가 재미없어요.")을 핵심 키워드로 기록'
                            ]
                        }
                    ]
                }
            },
            {
                step: 2,
                title: '사건 정리 및 패턴 분석',
                icon: 'timeline',
                content: {
                    items: [],
                    sections: [
                        {
                            title: '패턴 분석',
                            icon: 'timeline',
                            items: [
                                '"주초(월·화) 집중 발생" 패턴 도출',
                                '수면 습관 문제 추정',
                                '학습 의욕 저하 추정'
                            ],
                            text: '1차 추정 원인으로 제시합니다.'
                        }
                    ]
                }
            },
            {
                step: 3,
                title: '심층 문제 분석 및 진단',
                icon: 'psychology',
                content: {
                    sections: [
                        {
                            title: '문제 분류',
                            icon: 'psychology',
                            items: [
                                '학생의 진술(학교 흥미 저하) 분석',
                                '학습 동기 저하형 출결 문제로 분류'
                            ]
                        },
                        {
                            title: '규범 분석',
                            icon: 'gavel',
                            items: [
                                '성실한 학교생활 의무 위반',
                                '출결 의무 위반',
                                '책임감 부족',
                                '자기 관리 능력 미흡'
                            ]
                        }
                    ]
                }
            },
            {
                step: 4,
                title: '지도 방안 실행',
                icon: 'trending_up',
                content: {
                    sections: [
                        {
                            title: '자기 관리 및 계획 수립',
                            icon: 'trending_up',
                            items: [
                                '학생과 함께 1주일 목표 계획표를 앱 내에서 작성',
                                '구체적인 행동 목표(예: 1시간 일찍 자기)를 설정',
                                '출결 개선 시 칭찬 마일리지 자동 누적 기능을 활용하여 즉각적인 긍정적 보상 제공'
                            ]
                        },
                        {
                            title: '관계 및 동기 부여',
                            icon: 'psychology',
                            items: [
                                'C학생의 관심 과목을 누가기록에서 찾아 해당 교사와의 멘토링 연계 제안',
                                '학교생활의 흥미를 높임'
                            ]
                        },
                        {
                            title: '연계 및 알림',
                            icon: 'notifications',
                            items: [
                                '출결 개선 추이가 저조하거나 심리적 문제가 의심될 경우',
                                '위클래스 상담 연계 및 학부모 알림을 자동 발송 제안'
                            ]
                        }
                    ],
                    highlights: [
                        '학생의 자기 관리 능력을 향상시키고, 학교생활에 대한 긍정적인 동기를 부여하는 단계적 개입 방안을 제시합니다.'
                    ]
                }
            },
            {
                step: 5,
                title: '데이터 관리 및 NEIS 연계',
                icon: 'description',
                content: {
                    items: [
                        '학생의 노력과 변화의 과정을 중심으로 NEIS 기록 생성',
                        '데이터 기반 상담의 근거 마련'
                    ],
                    sections: [
                        {
                            title: '데이터 시각화',
                            icon: 'analytics',
                            items: [
                                'AI가 출결 변화 그래프를 자동 생성 및 저장',
                                '지도 효과를 시각적으로 분석'
                            ]
                        },
                        {
                            title: '데이터 활용',
                            icon: 'description',
                            items: [
                                '생활기록부 입력 시 참고자료',
                                '학부모 면담 자료'
                            ]
                        }
                    ],
                    highlights: [
                        'AI는 학생의 자발적인 노력과 개선 과정을 담은 문구를 생성하여 행발 기록의 긍정적인 측면을 강조합니다.'
                    ]
                }
            }
        ],
        neisTemplate: (data) => {
            const studentName = data.who.split('(')[0].trim() || '학생';
            return `${studentName}은(는) 최근 잦은 지각·결석을 보였으나 담임과의 면담 및 자기 관리 계획 수립 후 스스로 아침 루틴을 조정하고 등교 태도 개선을 위해 꾸준히 노력하고 있음. 책임감과 성실성을 향상시키기 위해 멘토교사 프로그램에 적극 참여함.`;
        }
    },
    // 고등학교: 온라인 폭언 및 단체 대화방 문제 대응
    'HIGH_CYBER_BULLYING': {
        type: '사이버 폭력',
        subType: '온라인 폭언/단체 대화방',
        schoolLevel: 'high',
        keywords: ['온라인', '사이버', '폭언', '단체채팅방', '단체 대화방', 'SNS', '비방', '조롱', '디지털', '온라인 폭력', '사이버 폭력', '채팅방', '메시지'],
        steps: [
            {
                step: 1,
                title: '상황 입력 및 증거 확보',
                icon: 'screenshot',
                content: {
                    sections: [
                        {
                            title: '증거 확보',
                            icon: 'screenshot',
                            items: [
                                '사이버 폭력의 증거를 확보',
                                '학부모나 학생에게 받은 문제 메시지 스크린샷을 앱에 첨부',
                                '사건의 개요를 정확히 기록'
                            ]
                        },
                        {
                            title: '사건 요약 기록',
                            icon: 'edit',
                            items: [
                                '텍스트 입력으로 사건을 요약 기록',
                                '예: "11/11 저녁, 반 단체채팅방 내에서 D학생이 E학생에게 공부 못한다는 조롱성 발언."'
                            ]
                        },
                        {
                            title: '면담 및 진술 확보',
                            icon: 'record_voice_over',
                            items: [
                                'D학생과 E학생을 개별 면담',
                                '음성 녹음 기능을 통해 진술을 확보(녹취 동의 고지)'
                            ]
                        },
                        {
                            title: '피해 학생 정서 상태 기록',
                            icon: 'psychology',
                            items: [
                                'E학생의 면담 시 위축 정도',
                                '불안',
                                '눈물 유무'
                            ],
                            text: '정서적 상태를 기록하여 피해 심각성을 판단합니다.'
                        }
                    ]
                }
            },
            {
                step: 2,
                title: '사건 정리 및 분석',
                icon: 'link',
                content: {
                    items: [
                        'AI가 첨부된 스크린샷과 진술을 기반으로 대화 흐름 분석'
                    ],
                    sections: [
                        {
                            title: '분석 결과',
                            icon: 'analytics',
                            items: [
                                '언어폭력 의심 발언 2회 확인',
                                '타 학생 동조 1명 확인'
                            ]
                        },
                        {
                            title: '과거 기록 확인',
                            icon: 'link',
                            items: [
                                'D학생의 누가기록 확인',
                                '과거에도 비슷한 언행 1회 지도 이력 확인',
                                '반복성 표시'
                            ]
                        }
                    ]
                }
            },
            {
                step: 3,
                title: '사이버 폭력 판단 및 진단',
                icon: 'gavel',
                content: {
                    sections: [
                        {
                            title: '사이버 폭력 판단',
                            icon: 'gavel',
                            items: [
                                '대화의 맥락 분석',
                                '피해자의 정서 분석',
                                '단순 갈등이 아닌 사이버 폭력임을 판단'
                            ],
                            text: '후속 조치에 필요한 근거를 마련합니다.'
                        },
                        {
                            title: '규범 분석',
                            icon: 'gavel',
                            items: [
                                '사이버폭력 금지 조항 위반 가능성 명시'
                            ]
                        },
                        {
                            title: '피해 학생 정서 분석',
                            icon: 'psychology',
                            items: [
                                'E학생 진술에서 자존감 저하 감지',
                                '불안 정서 감지'
                            ],
                            text: '피해 학생 보호 조치의 필요성을 최우선으로 제시합니다.'
                        }
                    ]
                }
            },
            {
                step: 4,
                title: '지도 방안 실행',
                icon: 'shield',
                content: {
                    sections: [
                        {
                            title: '가해 학생 즉시 조치',
                            icon: 'person',
                            items: [
                                'D학생에게 SNS상 비방의 심각성 및 파급력에 대해 지도',
                                '진심 어린 사과 방법 지도',
                                '재발 방지 서약 및 특별 교육 이수 안내'
                            ]
                        },
                        {
                            title: '피해 학생 보호',
                            icon: 'shield',
                            items: [
                                '위클래스 상담 연계를 즉시 진행',
                                '온라인 공간 차단',
                                '증거 보존 및 신고 절차 안내'
                            ],
                            text: '피해 학생이 스스로를 보호할 수 있는 구체적인 방법을 안내합니다.'
                        },
                        {
                            title: '학급 전체 예방',
                            icon: 'groups',
                            items: [
                                '전체 학급 대상 디지털 시민의식 교육',
                                '사이버 폭력 예방 특강 추진',
                                '학급 내 공동 책임 의식 함양'
                            ]
                        },
                        {
                            title: '가정 연계',
                            icon: 'home',
                            items: [
                                '학부모에게 상황을 객관적으로 공유',
                                '온라인 사용 습관에 대한 공동 지도 요청'
                            ]
                        }
                    ],
                    highlights: [
                        '가해 학생의 즉각적인 책임 인정과 피해 학생의 심리적 회복을 동시에 진행하고, 학급 전체에 대한 예방 교육을 강화합니다.'
                    ]
                }
            },
            {
                step: 5,
                title: '데이터 관리 및 NEIS 연계',
                icon: 'description',
                content: {
                    items: [
                        '학교의 지도 노력과 학생의 긍정적 변화를 중심으로 기록',
                        '모든 기록 및 지도 내용은 사이버 폭력 사안의 증거 자료로 보존'
                    ],
                    sections: [
                        {
                            title: '증거 자료 보존',
                            icon: 'archive',
                            items: [
                                '사이버 폭력 사안의 증거 자료 보존',
                                '추후 학폭위 등 공식 절차에 대비'
                            ]
                        },
                        {
                            title: 'NEIS 기록 생성',
                            icon: 'description',
                            text: 'AI는 학생의 온라인 예절 인식 변화를 담은 문구를 생성합니다.'
                        }
                    ]
                }
            }
        ],
        neisTemplate: (data) => {
            const whoParts = data.who.split(',').map(s => s.trim());
            const perpetrator = whoParts.find(p => p.includes('가해') || p.includes('D')) || whoParts[0];
            const studentName = perpetrator.split('(')[0].trim() || '학생';
            return `${studentName}은(는) 온라인 단체 채팅방에서 친구에게 부적절한 발언을 하였으며, 담임의 지도 및 디지털 시민의식 교육 이수 후 진심으로 사과하고 온라인 예절의 중요성 및 책임감을 깊이 인식하게 되었음. 이후 온라인상에서 긍정적인 언행을 위해 노력하고 있음.`;
        }
    },
    // 초등학교: 또래 갈등 대응
    'ELEMENTARY_PEER_CONFLICT': {
        type: '또래 갈등',
        subType: '단순 생활지도',
        schoolLevel: 'elementary',
        keywords: ['또래 갈등', '다툼', '밀침', '공 뺏음', '친구', '싸움', '갈등', '충동', '의사소통', '초등', '생활지도'],
        steps: [
            {
                step: 1,
                title: '상황 입력 및 증거 확보',
                icon: 'record_voice_over',
                content: {
                    sections: [
                        {
                            title: '초기 안전 확보',
                            icon: 'security',
                            items: [
                                '두 학생을 안전한 곳에 분리/착석',
                                '단순 행동 기록을 넘어, 학생들의 초기 감정 상태를 객관적으로 기록'
                            ]
                        },
                        {
                            title: '녹취 준비',
                            icon: 'record_voice_over',
                            items: [
                                '녹취 동의 안내 및 고지 절차 진행',
                                '교사 유도에 따라 A, B 학생의 진술을 녹음'
                            ]
                        },
                        {
                            title: '사실 정보 입력',
                            icon: 'edit',
                            items: [
                                '녹음 후 일시, 장소 등 사실 정보를 입력'
                            ]
                        },
                        {
                            title: '비언어적 감정 상태 기록',
                            icon: 'visibility',
                            items: [
                                '위축 정도',
                                '분노 척도(5/10)',
                                '눈물 유무'
                            ],
                            text: '체크리스트 형태로 입력합니다.'
                        }
                    ]
                }
            },
            {
                step: 2,
                title: '사건 정리 및 데이터 연계',
                icon: 'link',
                content: {
                    items: [
                        'AI가 음성을 텍스트로 자동 변환',
                        '시간 순서대로 사건을 요약 정리'
                    ],
                    sections: [
                        {
                            title: '과거 기록 비교',
                            icon: 'link',
                            items: [
                                'A, B 학생의 과거 누가기록 중 다툼 기록 확인',
                                '사안의 반복성 분석'
                            ]
                        }
                    ]
                }
            },
            {
                step: 3,
                title: '심층 문제 분석 및 교육 목표 설정',
                icon: 'psychology',
                content: {
                    sections: [
                        {
                            title: '사안 분류',
                            icon: 'psychology',
                            items: [
                                '사안의 성격을 단순 생활지도로 분류',
                                '학교폭력 사안이 아닌 단순 생활지도 기록으로 분류 제안'
                            ]
                        },
                        {
                            title: '핵심 기술 부족 분석',
                            icon: 'psychology',
                            items: [
                                {
                                    label: 'A학생',
                                    text: '충동 조절 능력 부족'
                                },
                                {
                                    label: 'B학생',
                                    text: '의사소통 기술 부족'
                                }
                            ],
                            text: '지도 목표를 설정합니다.'
                        },
                        {
                            title: '규범 위반 내용',
                            icon: 'gavel',
                            items: [
                                '친구와 사이좋게 지내기 위반',
                                '폭력 사용 금지 위반'
                            ],
                            text: '초등 수준의 규범 위반 내용을 명시합니다.'
                        }
                    ]
                }
            },
            {
                step: 4,
                title: '지도 및 개입 전략 실행',
                icon: 'handshake',
                content: {
                    sections: [
                        {
                            title: '감정 안정화',
                            icon: 'self_improvement',
                            items: [
                                '두 학생에게 1분간 눈을 감고 심호흡하도록 지도'
                            ]
                        },
                        {
                            title: '상황 객관화',
                            icon: 'description',
                            items: [
                                'AI가 정리한 사건 정리 내용을 학생들에게 읽어주며 사실관계 확인'
                            ]
                        },
                        {
                            title: '역지사지 유도',
                            icon: 'psychology',
                            items: [
                                '"만약 네가 공을 뺏기지 않았다면?"',
                                '"네가 밀지 않고 말로 했다면?"'
                            ],
                            text: '다른 선택의 가능성을 인지시킵니다.'
                        },
                        {
                            title: '갈등 해결 기술 훈련',
                            icon: 'handshake',
                            items: [
                                '서로 "미안해" 사과하기',
                                '재발 방지 약속',
                                'I-Message 활용 연습: "네가 공을 뺏어서 나는 기분이 나빴어. 다음에는 말로 먼저 부탁해."'
                            ],
                            text: '대화 스크립트를 연습시킵니다.'
                        },
                        {
                            title: '예방적 조치',
                            icon: 'shield',
                            items: [
                                '학급 전체에 적용할 쉬는 시간 놀이 규칙 재정립',
                                '예방적 조치를 교사에게 제안'
                            ]
                        }
                    ],
                    highlights: [
                        '단순 사과를 넘어 갈등 해결 기술(Conflict Resolution Skills)을 직접 훈련시키는 단계별 방안을 제시합니다.'
                    ]
                }
            },
            {
                step: 5,
                title: '데이터 관리 및 NEIS 연계',
                icon: 'description',
                content: {
                    items: [
                        '개인정보 보호 및 사안 관련 정보의 비공개 원칙 명시',
                        '학생들의 긍정적인 변화 과정을 강조하는 문구 생성'
                    ],
                    sections: [
                        {
                            title: 'NEIS 기록 생성',
                            icon: 'description',
                            items: [
                                '학생의 자발적인 노력 강조',
                                '긍정적 측면을 강조한 누가기록 문구 생성'
                            ],
                            text: '교사가 즉시 NEIS에 활용하도록 지원합니다.'
                        }
                    ],
                    highlights: [
                        '기록의 행정적 부담을 줄이고, 학생들의 긍정적인 변화 과정을 강조합니다.'
                    ]
                }
            }
        ],
        neisTemplate: (data) => {
            // A학생(밀침)과 B학생(공 뺏음) 구분
            const whoParts = data.who.split(',').map(s => s.trim());
            const studentA = whoParts.find(p => p.includes('A') || p.includes('밀')) || whoParts[0];
            const studentB = whoParts.find(p => p.includes('B') || p.includes('뺏')) || whoParts[1] || '학생';

            const nameA = studentA.split('(')[0].trim() || '학생';
            const nameB = studentB.split('(')[0].trim() || '학생';

            // A학생(밀침) NEIS 기록
            let record = `[A학생 누가기록] ${nameA}은(는) 쉬는 시간 공 문제로 친구를 밀치는 행동을 보였으나, 교사의 지도 후 자신의 행동을 즉시 반성하고 친구에게 먼저 사과하는 성숙한 모습을 보였으며, 갈등 상황에서 말로 표현하는 연습을 통해 긍정적인 변화를 기대함.`;

            // B학생(공 뺏음) NEIS 기록
            record += ` [B학생 누가기록] ${nameB}은(는) 공 문제로 친구와 다툼이 발생했을 때, 자신의 입장을 명확히 설명하면서도 친구의 사과를 너그럽게 받아들이는 포용력 있는 태도를 보임. 갈등 상황에서 친구에게 먼저 요청하는 의사소통 기술을 훈련하여 사회성을 함양함.`;

            return record;
        }
    },
    // 초등학교: 수업 방해 행동 대응
    'ELEMENTARY_CLASSROOM_DISRUPTION': {
        type: '수업 방해',
        subType: '반복적 수업 방해',
        schoolLevel: 'elementary',
        keywords: ['수업 방해', '집중력', '학습 부진', '흥미 저하', '수업 질서', '대화 시도', '학습지', '수학 시간', '참여', '초등'],
        steps: [
            {
                step: 1,
                title: '상황 입력 및 증거 확보',
                icon: 'event_note',
                content: {
                    sections: [
                        {
                            title: '문제 행동 기록',
                            icon: 'event_note',
                            items: [
                                '학생의 문제 행동을 시간, 장소, 과목별로 누적 기록',
                                '패턴 분석의 기초 자료를 확보'
                            ]
                        },
                        {
                            title: '면담 및 사건 기록',
                            icon: 'edit',
                            items: [
                                '수업 후 학생 면담 시 텍스트 입력 기능을 활용하여 사건을 기록',
                                '육하원칙에 따라 구체적 행동 사실을 기록',
                                '예: "C학생, 11월 7일 3교시 수학 시간, 교사 주의 2회에도 불구, 짝과 대화 시도. 학습지 풀이 안 함."'
                            ]
                        },
                        {
                            title: '면담 태도 기록 (선택 사항)',
                            icon: 'visibility',
                            items: [
                                '건성 대답',
                                '짜증',
                                '회피'
                            ],
                            text: '학생의 면담 태도를 간략히 기록합니다.'
                        }
                    ]
                }
            },
            {
                step: 2,
                title: '사건 정리 및 데이터 연계',
                icon: 'link',
                content: {
                    items: [
                        'AI가 현재 입력된 기록과 C학생의 과거 누적 기록을 즉시 불러옴',
                        '행동의 반복성을 확인'
                    ],
                    sections: [
                        {
                            title: '학교 데이터 연계',
                            icon: 'link',
                            items: [
                                '상담 기록',
                                '심리검사 결과',
                                '학업 성취도'
                            ],
                            text: '연계하여 분석합니다.'
                        }
                    ]
                }
            },
            {
                step: 3,
                title: '심층 문제 분석 및 패턴 도출',
                icon: 'psychology',
                content: {
                    sections: [
                        {
                            title: '핵심 패턴 도출',
                            icon: 'timeline',
                            items: [
                                '"C학생은 최근 2주간 수학 시간에만 주 2회 이상 유사한 행동을 보임"',
                                '특정 과목/시간대에 집중된 문제임을 제시'
                            ]
                        },
                        {
                            title: '근본 원인 추정',
                            icon: 'psychology',
                            items: [
                                '단순한 장난이 아닌 학습 부진 추정',
                                '흥미 저하 추정'
                            ],
                            text: '근본 원인으로 추정하여 교사에게 제시합니다.'
                        },
                        {
                            title: '규범 분석',
                            icon: 'gavel',
                            items: [
                                '수업 질서 유지 의무 위반',
                                '다른 학생의 학습권 침해 가능성'
                            ]
                        }
                    ],
                    highlights: [
                        '지도 목표를 설정합니다.'
                    ]
                }
            },
            {
                step: 4,
                title: '지도 및 개입 전략 실행',
                icon: 'trending_up',
                content: {
                    sections: [
                        {
                            title: '학습 흥미 유도',
                            icon: 'trending_up',
                            items: [
                                '다음 수학 시간에 C학생에게 간단한 발표 기회를 주어 참여와 흥미를 유도',
                                '학습지 난이도를 C학생 수준에 맞게 부분적으로 조절하여 작은 성공 경험 제공'
                            ]
                        },
                        {
                            title: '긍정적 행동 강화',
                            icon: 'thumb_up',
                            items: [
                                '5분간 집중하는 모습을 보일 시 즉각적인 칭찬 또는 긍정적 피드백 제공'
                            ]
                        },
                        {
                            title: '추후 관리 알림',
                            icon: 'notifications',
                            items: [
                                '행동이 지속되거나 다른 과목으로 확산될 시',
                                '학부모 상담 및 심층 상담 연계가 필요함을 알림'
                            ]
                        }
                    ],
                    highlights: [
                        '분석된 근본 원인(흥미 저하/학습 부진)을 직접적으로 해결하는 교육 중심의 지도 방안을 제시합니다.'
                    ]
                }
            },
            {
                step: 5,
                title: '데이터 관리 및 NEIS 연계',
                icon: 'description',
                content: {
                    items: [
                        '지도 내용이 C학생의 개별 데이터로 자동 누적',
                        '행동 패턴의 변화 추이를 분석'
                    ],
                    sections: [
                        {
                            title: '데이터 분석',
                            icon: 'analytics',
                            items: [
                                '축적된 데이터를 바탕으로 행동 패턴 변화 추이를 그래프로 분석',
                                '추후 심층 상담 또는 학부모 상담의 근거 자료로 활용'
                            ]
                        },
                        {
                            title: 'NEIS 기록 생성',
                            icon: 'description',
                            items: [
                                '학생의 노력 과정 강조',
                                '긍정적 변화 가능성을 담은 문구 생성'
                            ],
                            text: '행발 기록의 질을 높입니다.'
                        }
                    ]
                }
            }
        ],
        neisTemplate: (data) => {
            const studentName = data.who.split('(')[0].trim() || '학생';
            return `${studentName}은(는) 특정 과목 시간에 집중력 저하로 지도를 받았으나, 흥미 유도 활동에 참여하며 수업 참여 태도가 점차 개선되는 긍정적 변화를 보였으며, 자기 주도 학습 능력 향상을 위해 꾸준히 노력할 것으로 기대됨.`;
        }
    },
    // 초등학교: 민원성 학부모 상담 대응
    'ELEMENTARY_PARENT_COMPLAINT': {
        type: '학부모 민원',
        subType: '민원성 학부모 상담',
        schoolLevel: 'elementary',
        keywords: ['민원', '학부모', '따돌림', '소외감', '상담', '민원 대응', '학부모 연락', '학부모 주장', '오해', '초등'],
        steps: [
            {
                step: 1,
                title: '상황 입력 및 증거 확보',
                icon: 'record_voice_over',
                content: {
                    sections: [
                        {
                            title: '학부모 주장 기록',
                            icon: 'edit',
                            items: [
                                '학부모의 주장을 정확히 기록',
                                '텍스트 입력으로 학부모의 주장(민원 내용)과 연락 일시를 핵심만 기록',
                                '예: "D학생이 학교에서 따돌림을 당하는 것 같다"는 내용의 연락 접수'
                            ]
                        },
                        {
                            title: '학생 면담 및 진술 확보',
                            icon: 'record_voice_over',
                            items: [
                                'D학생 및 관련 학생(E, F)들과 개별 면담 진행',
                                '앱의 음성 녹음을 활용(녹취 동의 안내)',
                                '학생들의 진술을 통해 객관적인 사실 확보'
                            ]
                        },
                        {
                            title: '진술 신뢰도 판단 자료',
                            icon: 'visibility',
                            items: [
                                '학생들의 진술 시 태도',
                                '일관성',
                                '불안감'
                            ],
                            text: '텍스트로 보완하여 진술의 신뢰도를 판단하는 기초 자료로 활용합니다.'
                        }
                    ]
                }
            },
            {
                step: 2,
                title: '사건 정리 및 비교',
                icon: 'link',
                content: {
                    items: [
                        'AI가 각 학생의 면담 내용을 텍스트로 변환',
                        '객관적으로 재구성'
                    ],
                    sections: [
                        {
                            title: '진술 비교',
                            icon: 'compare',
                            items: [
                                '학생별 진술의 차이점 비교',
                                '사실관계 확정'
                            ],
                            text: '예: D의 소외감 vs. E, F의 못 들었음/오해 주장'
                        }
                    ]
                }
            },
            {
                step: 3,
                title: '심층 문제 분석 및 의도성 판단',
                icon: 'gavel',
                content: {
                    sections: [
                        {
                            title: '의도성 판단',
                            icon: 'gavel',
                            items: [
                                '지속성과 의도성 분석',
                                '"지속적·의도적 따돌림이 아닌, 놀이 과정에서의 오해 및 일시적 소외감"으로 잠정 결론'
                            ],
                            text: '근거: 학생 진술 일치 여부, 과거 누가기록'
                        },
                        {
                            title: '사안 분류',
                            icon: 'psychology',
                            items: [
                                '따돌림과 일시적 오해로 명확하게 분류',
                                '학부모 민원에 대응할 객관적 근거 마련'
                            ]
                        },
                        {
                            title: '핵심 규범',
                            icon: 'gavel',
                            items: [
                                '타인의 감정 존중',
                                '함께하는 공동체 의식 부족'
                            ],
                            text: '사회적 규범 측면을 분석합니다.'
                        }
                    ]
                }
            },
            {
                step: 4,
                title: '지도 및 개입 전략 실행',
                icon: 'support',
                content: {
                    sections: [
                        {
                            title: '즉각적 학생 지도',
                            icon: 'groups',
                            items: [
                                'D, E, F학생이 함께 모여 오해를 풀고 화해하도록 교사가 직접 중재'
                            ]
                        },
                        {
                            title: '역지사지 지도',
                            icon: 'psychology',
                            items: [
                                'E, F 학생에게 D학생이 느꼈을 소외감에 대해 이야기 나누도록 유도'
                            ]
                        },
                        {
                            title: '예방적 학급 지도',
                            icon: 'groups',
                            items: [
                                '모두가 참여하는 교실 놀이 활동',
                                '친구 부르기 규칙 재정립',
                                '소외 학생을 예방하고 학급의 결속력을 강화할 활동 계획'
                            ]
                        },
                        {
                            title: '학부모 회신 전략',
                            icon: 'support',
                            items: [
                                '객관적 사실과 학교의 조치 계획을 명확히 안내',
                                '교사의 감정적 대응을 배제하고 원칙적 대응을 하도록 돕는 멘트 초안 제시'
                            ]
                        }
                    ],
                    highlights: [
                        '학부모에게 회신할 객관적 근거와 재발 방지 계획을 마련하고, 학생들 간의 오해를 해소합니다.'
                    ]
                }
            },
            {
                step: 5,
                title: '데이터 관리 및 공식 기록 작성',
                icon: 'description',
                content: {
                    items: [
                        '민원 대응에 필요한 객관적 근거 자료를 즉시 생성',
                        '교사의 행정적 부담을 최소화'
                    ],
                    sections: [
                        {
                            title: '학부모 상담 자료 생성',
                            icon: 'description',
                            items: [
                                'AI가 민원 대응 및 상담에 즉시 활용할 수 있는 학부모 상담용 근거 자료 양식을 자동 생성'
                            ]
                        },
                        {
                            title: '근거 자료 내용',
                            icon: 'list',
                            items: [
                                '접수 내용(학부모 주장)',
                                '학교의 사실 확인(면담 결과 및 의도성 판단)',
                                '학교의 조치 및 지도 계획(즉각/재발 방지 조치)',
                                '상담 가이드(멘트 초안)'
                            ],
                            text: '구조화하여 제시합니다.'
                        }
                    ],
                    highlights: [
                        '이 사안은 민원 대응 및 일반 상담 기록으로 분류하며, 학생의 성장을 중심으로 기록합니다.'
                    ]
                }
            }
        ],
        neisTemplate: (data) => {
            const studentName = data.who.split('(')[0].trim() || '학생';
            return `${studentName}은(는) 친구 관계에서 일시적 소외감을 느꼈으나, 담임교사와의 상담을 통해 오해를 해소하고 교우 관계를 개선하기 위해 노력함. 친구의 감정을 공감하고 배려하는 태도를 함양할 것으로 기대됨.`;
        }
    },
    // 또래 갈등 시나리오
    'PEER_CONFLICT_MISUNDERSTANDING': {
        type: '또래 갈등',
        subType: '오해',
        keywords: ['오해', '착각', '잘못 알고', '모르고'],
        steps: [
            {
                step: 1,
                title: '즉각 대응',
                icon: 'self_improvement',
                content: '양쪽 학생을 분리하고 심호흡을 통해 흥분된 감정을 가라앉히도록 지도합니다. "잠시 멈추고 숨을 깊게 쉬어보자"라고 말하며 안정감을 줍니다.'
            },
            {
                step: 2,
                title: '상황 이해',
                icon: 'hearing',
                content: '각자의 입장을 충분히 듣습니다. "어떤 점이 억울했니?"라고 물으며 상대방의 의도를 확인하지 않고 추측한 부분이 있는지 점검하게 합니다.'
            },
            {
                step: 3,
                title: '해결 방안',
                icon: 'handshake',
                content: '서로의 오해를 풀 수 있도록 대화를 유도합니다. "사실은 ~하려던 것이었어"라고 자신의 진짜 의도를 설명하고, 오해한 부분에 대해 사과하게 합니다.'
            },
            {
                step: 4,
                title: '사후 관리',
                icon: 'visibility',
                content: '화해 후 잘 지내는지 관찰하고, 비슷한 오해가 생기지 않도록 의사소통 방법에 대해 짧게 상담합니다.'
            }
        ],
        neisTemplate: (data) => `${data.date} ${data.where}에서 ${data.who} 간에 오해로 인한 다툼이 발생함. 양측의 이야기를 경청하고 사실관계를 확인하여 오해임을 인지시킴. 서로 사과하고 화해하도록 지도하였으며, 추후 유사한 갈등이 발생하지 않도록 의사소통 교육을 실시함.`
    },
    'PEER_CONFLICT_COMPETITION': {
        type: '또래 갈등',
        subType: '경쟁',
        keywords: ['게임', '시합', '경기', '승패', '졌다', '이겼다', '반칙'],
        steps: [
            {
                step: 1,
                title: '즉각 대응',
                icon: 'stop_circle',
                content: '활동을 즉시 중단시키고 과열된 분위기를 진정시킵니다. 승패보다 친구와의 관계가 더 중요함을 상기시킵니다.'
            },
            {
                step: 2,
                title: '상황 이해',
                icon: 'rule',
                content: '규칙 준수 여부와 갈등의 원인을 파악합니다. 서로가 생각하는 규칙이 달랐는지, 감정이 상한 구체적인 포인트가 무엇인지 확인합니다.'
            },
            {
                step: 3,
                title: '해결 방안',
                icon: 'gavel',
                content: '올바른 규칙을 다시 합의하고, 결과에 승복하는 태도(스포츠맨십)를 가르칩니다. 서로 악수하거나 격려하며 마무리하게 합니다.'
            },
            {
                step: 4,
                title: '사후 관리',
                icon: 'groups',
                content: '다음 활동 시 규칙을 잘 지키는지 모니터링하고, 협동이 필요한 활동에 함께 참여시켜 관계 회복을 돕습니다.'
            }
        ],
        neisTemplate: (data) => `${data.date} ${data.where}에서 ${data.who} 간에 놀이(활동) 중 승패와 관련한 갈등이 발생함. 과열된 경쟁심을 진정시키고 규칙 준수와 스포츠맨십의 중요성을 지도함. 서로의 감정을 인정하고 화해하도록 이끌었으며, 협동의 가치를 재교육함.`
    },
    'PEER_CONFLICT_BULLYING': {
        type: '또래 갈등',
        subType: '괴롭힘',
        keywords: ['놀림', '괴롭힘', '따돌림', '지속적', '반복', '장난'],
        steps: [
            {
                step: 1,
                title: '즉각 대응',
                icon: 'shield',
                content: '피해 학생을 즉시 보호하고 가해 학생과 분리합니다. "친구를 불편하게 하는 행동은 장난이 아니다"라고 단호하게 제지합니다.'
            },
            {
                step: 2,
                title: '상황 이해',
                icon: 'psychology',
                content: '피해 학생의 심리적 고통을 공감해주고, 가해 학생에게는 행동의 심각성과 상대방이 느꼈을 감정을 역지사지로 생각해보게 합니다.'
            },
            {
                step: 3,
                title: '해결 방안',
                icon: 'assignment_turned_in',
                content: '진정성 있는 사과를 하게 하고, 재발 방지 서약이나 약속을 받습니다. 학급 규칙을 상기시키며 타인을 존중하는 태도를 교육합니다.'
            },
            {
                step: 4,
                title: '사후 관리',
                icon: 'contact_phone',
                content: '학부모에게 사실을 알리고 가정 연계 지도를 요청합니다. 지속적인 관찰과 상담을 통해 2차 가해를 예방합니다.'
            }
        ],
        neisTemplate: (data) => `${data.date} ${data.where}에서 ${data.who} 간에 부적절한 언행으로 인한 갈등이 발생함. 피해 학생의 심정을 헤아리도록 역지사지 교육을 실시하고, 타인을 존중하는 태도의 중요성을 지도함. 가해 학생은 잘못을 인정하고 사과하였으며, 재발 방지를 위해 지속적으로 상담 및 관찰하기로 함.`
    },
    // 기본 템플릿 (매칭되는 것이 없을 때)
    'DEFAULT': {
        type: '생활지도',
        subType: '일반',
        keywords: [],
        steps: [
            {
                step: 1,
                title: '즉각 대응',
                icon: 'notifications_active',
                content: '문제 행동을 멈추게 하고 차분한 분위기를 조성합니다. 학생의 감정 상태를 살피고 안전을 확보합니다.'
            },
            {
                step: 2,
                title: '상황 이해',
                icon: 'question_answer',
                content: '육하원칙에 따라 사건의 경위를 파악합니다. 학생의 이야기를 경청하며 행동의 원인과 배경을 이해하려고 노력합니다.'
            },
            {
                step: 3,
                title: '해결 방안',
                icon: 'lightbulb',
                content: '학생 스스로 잘못된 점을 깨닫고 대안 행동을 찾도록 돕습니다. 필요한 경우 사과, 배상, 규칙 준수 서약 등의 조치를 취합니다.'
            },
            {
                step: 4,
                title: '사후 관리',
                icon: 'update',
                content: '행동 변화를 지속적으로 관찰하고 격려합니다. 필요 시 학부모와 상담하거나 추가적인 생활지도를 실시합니다.'
            }
        ],
        neisTemplate: (data) => {
            // User requested style: Concisely capture Cause -> Action -> Result
            // "Step 4 example" style is: "Confirmed fact -> Action taken -> Follow-up plan/Student attitude"
            const studentName = data.who.split('(')[0].trim() || '학생';

            // Generic but structured format
            return `${data.date} ${data.where}에서 ${data.what} 사안이 발생함. 학생과의 면담을 통해 사실관계를 확인하고 ${data.incidentType}에 대한 올바른 태도를 지도함. 학생은 자신의 행동을 돌아보고 추후 유사한 일이 발생하지 않도록 노력하겠다고 다짐함.`;
        }
    }
};

/**
 * Select appropriate guidance template based on analysis
 */
export function selectGuidanceTemplate(analysis, schoolLevel = 'all') {
    const { incidentType, what = '', why = '', how = '' } = analysis;
    const text = `${incidentType} ${what} ${why} ${how}`;

    // 학교급별 템플릿 필터링 함수
    const matchesSchoolLevel = (template) => {
        if (!template.schoolLevel) return true; // schoolLevel이 없으면 모든 학교급에 적용
        if (schoolLevel === 'all') return true; // 교사가 all이면 모든 템플릿 사용 가능
        return template.schoolLevel === schoolLevel || template.schoolLevel === 'all';
    };

    // 1. 중학교: 일방적 괴롭힘/폭력 (우선순위 높음)
    if (matchesSchoolLevel(GUIDANCE_TEMPLATES.MIDDLE_BULLYING_VIOLENCE)) {
        if (GUIDANCE_TEMPLATES.MIDDLE_BULLYING_VIOLENCE.keywords.some(k => text.includes(k))) {
            return GUIDANCE_TEMPLATES.MIDDLE_BULLYING_VIOLENCE;
        }
    }

    // 2. 중학교: 정서 및 우울 위기 대응
    if (matchesSchoolLevel(GUIDANCE_TEMPLATES.MIDDLE_EMOTIONAL_CRISIS)) {
        if (GUIDANCE_TEMPLATES.MIDDLE_EMOTIONAL_CRISIS.keywords.some(k => text.includes(k))) {
            return GUIDANCE_TEMPLATES.MIDDLE_EMOTIONAL_CRISIS;
        }
    }

    // 3. 중학교: 수업 방해 및 교권침해 대응
    if (matchesSchoolLevel(GUIDANCE_TEMPLATES.MIDDLE_CLASSROOM_DISRUPTION)) {
        if (GUIDANCE_TEMPLATES.MIDDLE_CLASSROOM_DISRUPTION.keywords.some(k => text.includes(k))) {
            return GUIDANCE_TEMPLATES.MIDDLE_CLASSROOM_DISRUPTION;
        }
    }

    // 4. 고등학교: 교내 흡연 의심 대응
    if (matchesSchoolLevel(GUIDANCE_TEMPLATES.HIGH_SMOKING_SUSPICION)) {
        if (GUIDANCE_TEMPLATES.HIGH_SMOKING_SUSPICION.keywords.some(k => text.includes(k))) {
            return GUIDANCE_TEMPLATES.HIGH_SMOKING_SUSPICION;
        }
    }

    // 5. 고등학교: 출결 문제 지속 대응
    if (matchesSchoolLevel(GUIDANCE_TEMPLATES.HIGH_ATTENDANCE_ISSUE)) {
        if (GUIDANCE_TEMPLATES.HIGH_ATTENDANCE_ISSUE.keywords.some(k => text.includes(k))) {
            return GUIDANCE_TEMPLATES.HIGH_ATTENDANCE_ISSUE;
        }
    }

    // 6. 고등학교: 온라인 폭언 및 단체 대화방 문제 대응
    if (matchesSchoolLevel(GUIDANCE_TEMPLATES.HIGH_CYBER_BULLYING)) {
        if (GUIDANCE_TEMPLATES.HIGH_CYBER_BULLYING.keywords.some(k => text.includes(k))) {
            return GUIDANCE_TEMPLATES.HIGH_CYBER_BULLYING;
        }
    }

    // 7. 초등학교: 또래 갈등 대응
    if (matchesSchoolLevel(GUIDANCE_TEMPLATES.ELEMENTARY_PEER_CONFLICT)) {
        if (GUIDANCE_TEMPLATES.ELEMENTARY_PEER_CONFLICT.keywords.some(k => text.includes(k))) {
            return GUIDANCE_TEMPLATES.ELEMENTARY_PEER_CONFLICT;
        }
    }

    // 8. 초등학교: 수업 방해 행동 대응
    if (matchesSchoolLevel(GUIDANCE_TEMPLATES.ELEMENTARY_CLASSROOM_DISRUPTION)) {
        if (GUIDANCE_TEMPLATES.ELEMENTARY_CLASSROOM_DISRUPTION.keywords.some(k => text.includes(k))) {
            return GUIDANCE_TEMPLATES.ELEMENTARY_CLASSROOM_DISRUPTION;
        }
    }

    // 9. 초등학교: 민원성 학부모 상담 대응
    if (matchesSchoolLevel(GUIDANCE_TEMPLATES.ELEMENTARY_PARENT_COMPLAINT)) {
        if (GUIDANCE_TEMPLATES.ELEMENTARY_PARENT_COMPLAINT.keywords.some(k => text.includes(k))) {
            return GUIDANCE_TEMPLATES.ELEMENTARY_PARENT_COMPLAINT;
        }
    }

    // 10. 또래 갈등 카테고리 확인 (기존 공통 템플릿)
    if (incidentType && incidentType.includes('갈등')) {
        // 키워드 매칭
        if (matchesSchoolLevel(GUIDANCE_TEMPLATES.PEER_CONFLICT_MISUNDERSTANDING)) {
            if (GUIDANCE_TEMPLATES.PEER_CONFLICT_MISUNDERSTANDING.keywords.some(k => text.includes(k))) {
                return GUIDANCE_TEMPLATES.PEER_CONFLICT_MISUNDERSTANDING;
            }
        }
        if (matchesSchoolLevel(GUIDANCE_TEMPLATES.PEER_CONFLICT_COMPETITION)) {
            if (GUIDANCE_TEMPLATES.PEER_CONFLICT_COMPETITION.keywords.some(k => text.includes(k))) {
                return GUIDANCE_TEMPLATES.PEER_CONFLICT_COMPETITION;
            }
        }
        if (matchesSchoolLevel(GUIDANCE_TEMPLATES.PEER_CONFLICT_BULLYING)) {
            if (GUIDANCE_TEMPLATES.PEER_CONFLICT_BULLYING.keywords.some(k => text.includes(k))) {
                return GUIDANCE_TEMPLATES.PEER_CONFLICT_BULLYING;
            }
        }
    }

    // 매칭되는 것이 없으면 기본 템플릿 반환
    return GUIDANCE_TEMPLATES.DEFAULT;
}

/**
 * Generate NEIS record using template
 */
export function generateNeisRecord(analysis, template) {
    const data = {
        date: analysis.when || '일시 미상',
        where: analysis.where || '장소 미상',
        who: analysis.who || '학생',
        what: analysis.what || '사안',
        incidentType: analysis.incidentType || '생활지도'
    };

    // 템플릿 함수 실행
    if (typeof template.neisTemplate === 'function') {
        return template.neisTemplate(data);
    }

    return template.neisTemplate;
}
