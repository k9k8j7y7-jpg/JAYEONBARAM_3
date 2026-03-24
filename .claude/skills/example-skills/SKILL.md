---
name: example-skills
description: Skill 작성 예시 템플릿 - 새로운 skill을 만들 때 참고하세요
---

# Skill 작성 예시 템플릿

이 파일은 새로운 skill을 만들 때 참고할 수 있는 예시 템플릿입니다.

---

## 프론트매터 (Frontmatter) 설명

```yaml
---
name: skill-name          # skill 이름 (슬래시 명령어로 사용됨: /skill-name)
description: 설명         # skill이 언제 사용되는지 한 줄 설명
---
```

---

## SKILL.md 기본 구조

### 1. 간단한 skill 예시

```markdown
---
name: my-skill
description: 특정 작업을 도와주는 skill
---

# My Skill

## 역할
이 skill이 무엇을 하는지 설명합니다.

## 지침
Claude가 따라야 할 구체적인 지침을 작성합니다.
- 규칙 1
- 규칙 2

## 출력 형식
결과물의 형식을 지정합니다.
```

### 2. 지원 파일 포함 예시

```
.claude/skills/my-skill/
├── SKILL.md          # 필수: 메인 skill 파일
├── template.md       # 선택: 출력 템플릿
└── examples/
    └── example1.md   # 선택: 예시 파일
```

### 3. 외부 파일 참조 예시

```markdown
---
name: my-skill
description: 템플릿을 사용하는 skill
---

아래 템플릿을 사용하세요:

[template.md 파일 내용 참조]
```

---

## 좋은 Skill 작성 팁

1. **명확한 역할 정의** - skill이 무엇을 하는지 구체적으로 작성
2. **구체적인 지침** - Claude가 따라야 할 단계별 지침 포함
3. **출력 형식 지정** - 원하는 결과물 형식을 명시
4. **예시 포함** - 입력/출력 예시를 제공하면 더 정확한 결과
5. **범위 제한** - skill의 범위를 명확히 하여 불필요한 작업 방지

---

## 사용법

`/example-skills` 실행 후 새 skill을 어떻게 만들지 질문하세요.
