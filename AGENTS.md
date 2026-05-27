# AGENTS.md

## Purpose
This folder is used as a planning and documentation area for AI-assisted development.

## Language
- Respond in Japanese unless otherwise requested.
- Technical terms may be kept in English when clearer.

## Safety rules
- Do not store API keys, passwords, tokens, or personal information.
- Do not include company confidential information unless explicitly approved.
- Do not delete or overwrite existing files without explaining the change first.
- Before editing code, explain the implementation plan.

## Workflow
1. Read the relevant specification in 1_Specs.
2. Propose an implementation plan before writing code.
3. Keep changes small and reviewable.
4. After work, summarize:
   - What was changed
   - Files changed
   - How to test
   - Remaining issues
5. Append important notes to 3_Logs/dev-log.md.

## Folder guide
- 0_Ideas: rough ideas
- 1_Specs: specifications and requirements
- 2_Prompts: reusable prompts
- 3_Logs: development logs
- 4_Output: generated drafts, README drafts, design notes
- 99_Archive: archived materials

## Important
The actual application source code should usually be outside the Obsidian Vault.
This Obsidian folder is mainly for planning, prompts, and logs.

## Shared Context Engine

このプロジェクトで作業を始める前に、必要に応じて以下の共有文脈入口を確認する。

C:\Users\topro\Dropbox\Ts context vault\04_Projects\AI_Dev\context-index.md

このファイルは、Codex と Claude Code が同じ前提から作業を始めるための共通入口である。

作業時のルール:

- vault全体を読まない。
- まず context-index.md を読み、そこに書かれた必要最小限のファイルだけを参照する。
- 実装仕様の正本は、このプロジェクト内の docs/spec.md とする。
- 作業履歴の正本は、このプロジェクト内の docs/dev-log.md とする。
- Obsidian側の仕様メモは、概要、検討メモ、参照リンクとして扱う。
- 古いログや検討メモを、現在の仕様として扱わない。
- 作業後に共有文脈へ影響がある場合は、update-policy.md に従って必要な文脈ファイルを更新する。

読む優先順位:

1. このプロジェクトの AGENTS.md
2. 共有文脈入口 context-index.md
3. このプロジェクトの README.md
4. このプロジェクトの docs/spec.md
5. このプロジェクトの docs/dev-log.md

ただし、ユーザーのこのチャットでの明示指示が最優先である。
