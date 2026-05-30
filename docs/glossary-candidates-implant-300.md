# インプラント系 用語集レビュー候補 300語

作成日: 2026-05-29

このファイルはレビュー用です。本番用語集 `public/data/dental-glossary.json` にはまだ反映していない候補を含みます。

## 使い方
- `source = 既存`: 現在の標準用語集に入っている語です。
- `source = 候補`: 追加候補です。確認後に本番用語集へ取り込みます。
- `risk = true`: 数字、単位、部位、術式、合併症、禁忌・適応など、翻訳後の確認対象にしたい語です。
- 読み方は講義・文字起こし補助を意識した仮案です。専門家レビュー前提です。

## 参照した公開情報
- 日本口腔インプラント学会 学術用語集: https://www.shika-implant.org/shika/wp-content/uploads/2024/03/2020_science_thirdedition.pdf
- FDA Dental Implants: https://www.fda.gov/medical-devices/dental-devices/dental-implants-what-you-should-know
- ADI Glossary of Dental Implant Terms: https://www.adi.org.uk/resources/glossary_of_terms/
- 上顎洞底提升专家共识: https://www.cndent.com/wp-content/uploads/2024/11/82-%E4%B8%8A%E9%A2%8C%E7%AA%A6%E5%BA%95%E6%8F%90%E5%8D%87%E4%B8%93%E5%AE%B6%E5%85%B1%E8%AF%86.pdf

## 候補表

| no | source | category | ja | reading | en | zh | risk | note |
|---:|---|---|---|---|---|---|---|---|
| 1 | 既存 | implant | インプラント | いんぷらんと | dental implant | 牙种植体 | false | 文脈によりimplantでも可 |
| 2 | 既存 | surgery | インプラント埋入 | いんぷらんとまいにゅう | implant placement | 种植体植入 | false |  |
| 3 | 既存 | anatomy | 上顎 | じょうがく | maxilla | 上颌 | true |  |
| 4 | 既存 | anatomy | 下顎 | かがく | mandible | 下颌 | true |  |
| 5 | 既存 | surgery | 骨造成 | こつぞうせい | bone augmentation | 骨增量 | false |  |
| 6 | 既存 | prosthetics | 即時荷重 | そくじかじゅう | immediate loading | 即刻负重 | true |  |
| 7 | 既存 | digital | ガイデッドサージェリー | がいでっどさーじぇりー | guided surgery | 引导种植手术 | false |  |
| 8 | 既存 | unit | Ncm | にゅーとん | Ncm | Ncm | true |  |
| 9 | 既存 | implant | インプラント体 | いんぷらんとたい | implant body / fixture | 种植体 | false |  |
| 10 | 既存 | prosthetics | アバットメント | あばっとめんと | implant abutment | 种植基台 | false |  |
| 11 | 既存 | prosthetics | 基台 | きだい | abutment | 基台 | false |  |
| 12 | 既存 | prosthetics | アバットメントスクリュー | あばっとめんとすくりゅー | abutment screw | 基台螺丝 | true | ゆるみや破折に関わるため要確認 |
| 13 | 既存 | prosthetics | インプラント上部構造 | いんぷらんとじょうぶこうぞう | implant superstructure | 种植修复体 | false |  |
| 14 | 既存 | implant | オッセオインテグレーション | おっせおいんてぐれーしょん | osseointegration | 骨结合 | false |  |
| 15 | 既存 | implant | 骨結合 | こつけつごう | osseointegration | 骨结合 | false |  |
| 16 | 既存 | implant | 初期固定 | しょきこてい | primary stability | 初期稳定性 | true |  |
| 17 | 既存 | implant | 二次固定 | にじこてい | secondary stability | 二期稳定性 | true |  |
| 18 | 既存 | surgery | 埋入トルク | まいにゅうとるく | insertion torque | 植入扭矩 | true | 数値と単位を必ず確認 |
| 19 | 既存 | surgery | 即時埋入 | そくじまいにゅう | immediate implant placement | 即刻种植 | true |  |
| 20 | 既存 | prosthetics | 即時負荷 | そくじふか | immediate loading | 即刻负重 | true |  |
| 21 | 既存 | surgery | 遅延埋入 | ちえんまいにゅう | delayed implant placement | 延期种植 | true |  |
| 22 | 既存 | digital | サージカルガイド | さーじかるがいど | surgical guide | 种植导板 | false |  |
| 23 | 既存 | surgery | GBR | じーびーあーる | guided bone regeneration | 引导骨再生 | false |  |
| 24 | 既存 | surgery | 骨再生誘導法 | こつさいせいゆうどうほう | guided bone regeneration | 引导骨再生 | false |  |
| 25 | 既存 | surgery | 骨補填材 | こつほてんざい | bone substitute / bone graft material | 骨替代材料 | false |  |
| 26 | 既存 | surgery | 骨増生 | こつぞうせい | bone augmentation | 骨增量 | false |  |
| 27 | 既存 | surgery | 自家骨 | じかこつ | autogenous bone / autograft | 自体骨 | false |  |
| 28 | 既存 | surgery | 他家骨 | たかこつ | allograft | 同种异体骨 | false |  |
| 29 | 既存 | surgery | 異種骨 | いしゅこつ | xenograft | 异种骨 | false |  |
| 30 | 既存 | surgery | 人工骨 | じんこうこつ | synthetic bone substitute | 人工骨材料 | false |  |
| 31 | 既存 | surgery | 上顎洞底挙上術 | じょうがくどうていきょじょうじゅつ | sinus floor elevation | 上颌窦底提升 | true |  |
| 32 | 既存 | surgery | サイナスリフト | さいなすりふと | sinus lift / lateral window technique | 侧壁开窗上颌窦底提升 | true |  |
| 33 | 既存 | surgery | ソケットリフト | そけっとりふと | crestal approach / transalveolar sinus floor elevation | 穿牙槽嵴上颌窦底提升 | true |  |
| 34 | 既存 | anatomy | 上顎洞粘膜 | じょうがくどうねんまく | maxillary sinus mucous membrane | 上颌窦黏膜 | true |  |
| 35 | 既存 | anatomy | シュナイダー膜 | しゅないだーまく | Schneiderian membrane | 施耐德膜 | true | 正式表現としては上顎洞粘膜を優先 |
| 36 | 既存 | complication | 上顎洞穿孔 | じょうがくどうせんこう | sinus perforation | 上颌窦穿孔 | true |  |
| 37 | 既存 | complication | 上顎洞迷入 | じょうがくどうめいにゅう | displacement into the maxillary sinus | 误入上颌窦 | true |  |
| 38 | 既存 | anatomy | 残存骨高径 | ざんぞんこつこうけい | residual bone height | 剩余骨高度 | true |  |
| 39 | 既存 | anatomy | 骨密度 | こつみつど | bone density | 骨密度 | true |  |
| 40 | 既存 | anatomy | 歯槽骨 | しそうこつ | alveolar bone | 牙槽骨 | false |  |
| 41 | 既存 | anatomy | 歯槽堤 | しそうてい | alveolar ridge | 牙槽嵴 | false |  |
| 42 | 既存 | complication | インプラント周囲炎 | いんぷらんとしゅういえん | peri-implantitis | 种植体周围炎 | false |  |
| 43 | 既存 | complication | インプラント周囲粘膜炎 | いんぷらんとしゅういねんまくえん | peri-implant mucositis | 种植体周围黏膜炎 | false |  |
| 44 | 既存 | prosthetics | マイクロギャップ | まいくろぎゃっぷ | microgap | 微间隙 | false |  |
| 45 | 既存 | prosthetics | プラットフォームスイッチング | ぷらっとふぉーむすいっちんぐ | platform switching | 平台转移 | false |  |
| 46 | 既存 | surgery | フラップレスサージェリー | ふらっぷれすさーじぇりー | flapless surgery | 不翻瓣手术 | false |  |
| 47 | 既存 | prosthetics | 印象採得 | いんしょうさいとく | impression taking | 取模 | false |  |
| 48 | 既存 | digital | 光学印象 | こうがくいんしょう | optical impression | 光学印模 | false |  |
| 49 | 既存 | digital | 口腔内スキャナー | こうくうないすきゃなー | intraoral scanner | 口内扫描仪 | false |  |
| 50 | 既存 | digital | スキャンボディ | すきゃんぼでぃ | scan body | 扫描杆 | false |  |
| 51 | 既存 | prosthetics | アクセスホール | あくせすほーる | access hole | 通道孔 | false |  |
| 52 | 既存 | prosthetics | スクリュー固定 | すくりゅーこてい | screw-retained restoration | 螺丝固位 | true |  |
| 53 | 既存 | prosthetics | セメント固定 | せめんとこてい | cement-retained restoration | 粘接固位 | true |  |
| 54 | 既存 | prosthetics | プロビジョナルレストレーション | ぷろびじょなるれすとれーしょん | provisional restoration | 临时修复体 | false |  |
| 55 | 既存 | prosthetics | 暫間補綴 | ざんかんほてつ | provisional prosthesis | 临时修复 | false |  |
| 56 | 既存 | prosthetics | 印象用コーピング | いんしょうようこーぴんぐ | impression coping | 印模转移杆 | false |  |
| 57 | 既存 | surgery | 切開 | せっかい | incision | 切开 | true |  |
| 58 | 既存 | surgery | 剥離 | はくり | flap elevation / reflection | 翻瓣剥离 | true |  |
| 59 | 既存 | surgery | 縫合 | ほうごう | suturing | 缝合 | false |  |
| 60 | 既存 | surgery | 抜歯即時埋入 | ばっしそくじまいにゅう | immediate implant placement after extraction | 拔牙后即刻种植 | true |  |
| 61 | 既存 | surgery | フラップ | ふらっぷ | flap | 瓣 | false |  |
| 62 | 既存 | surgery | ドリリング | どりりんぐ | drilling | 备孔 | true |  |
| 63 | 既存 | surgery | パイロットドリル | ぱいろっとどりる | pilot drill | 先锋钻 | false |  |
| 64 | 既存 | surgery | 最終ドリル | さいしゅうどりる | final drill | 终末钻 | false |  |
| 65 | 既存 | surgery | メンブレン | めんぶれん | membrane | 屏障膜 | false |  |
| 66 | 既存 | surgery | 吸収性膜 | きゅうしゅうせいまく | resorbable membrane | 可吸收膜 | false |  |
| 67 | 既存 | surgery | 非吸収性膜 | ひきゅうしゅうせいまく | non-resorbable membrane | 不可吸收膜 | false |  |
| 68 | 既存 | complication | 裂開 | れっかい | dehiscence | 裂开 | true |  |
| 69 | 既存 | complication | 開窓 | かいそう | fenestration | 骨开窗 | true |  |
| 70 | 既存 | complication | 動揺 | どうよう | mobility | 松动 | true |  |
| 71 | 既存 | complication | スクリュー緩み | すくりゅーゆるみ | screw loosening | 螺丝松动 | true |  |
| 72 | 既存 | complication | 脱落 | だつらく | detachment / loss | 脱落 | true |  |
| 73 | 既存 | complication | 感染 | かんせん | infection | 感染 | true |  |
| 74 | 既存 | complication | 骨吸収 | こつきゅうしゅう | bone resorption | 骨吸收 | true |  |
| 75 | 既存 | digital | CBCT | しーびーしーてぃー | CBCT | CBCT | false |  |
| 76 | 既存 | digital | CT | しーてぃー | CT | CT | false |  |
| 77 | 既存 | digital | IOS | あいおーえす | intraoral scanner / IOS | 口内扫描 | false |  |
| 78 | 既存 | digital | ナビゲーション手術 | なびげーしょんしゅじゅつ | navigation surgery | 导航手术 | false |  |
| 79 | 既存 | anatomy | 下歯槽神経 | かしそうしんけい | inferior alveolar nerve | 下牙槽神经 | true |  |
| 80 | 既存 | anatomy | オトガイ孔 | おとがいこう | mental foramen | 颏孔 | true |  |
| 81 | 既存 | anatomy | 上顎洞 | じょうがくどう | maxillary sinus | 上颌窦 | true |  |
| 82 | 既存 | anatomy | 頬側 | きょうそく | buccal side | 颊侧 | true |  |
| 83 | 既存 | anatomy | 舌側 | ぜっそく | lingual side | 舌侧 | true |  |
| 84 | 既存 | anatomy | 近心 | きんしん | mesial | 近中 | true |  |
| 85 | 既存 | anatomy | 遠心 | えんしん | distal | 远中 | true |  |
| 86 | 既存 | anatomy | 唇側 | しんそく | labial side | 唇侧 | true |  |
| 87 | 候補 | implant | インプラントシステム | いんぷらんとしすてむ | implant system | 种植系统 | false |  |
| 88 | 候補 | implant | インプラントフィクスチャー | いんぷらんとふぃくすちゃー | implant fixture | 种植体 | false |  |
| 89 | 候補 | implant | フィクスチャー | ふぃくすちゃー | fixture | 种植体 | false |  |
| 90 | 候補 | implant | ワンピースインプラント | わんぴーすいんぷらんと | one-piece implant | 一段式种植体 | false |  |
| 91 | 候補 | implant | ツーピースインプラント | つーぴーすいんぷらんと | two-piece implant | 两段式种植体 | false |  |
| 92 | 候補 | implant | テーパードインプラント | てーぱーどいんぷらんと | tapered implant | 锥形种植体 | false |  |
| 93 | 候補 | implant | ストレートインプラント | すとれーといんぷらんと | straight implant | 直柱形种植体 | false |  |
| 94 | 候補 | implant | ショートインプラント | しょーといんぷらんと | short implant | 短种植体 | true |  |
| 95 | 候補 | implant | ナローインプラント | なろーいんぷらんと | narrow implant | 窄种植体 | true |  |
| 96 | 候補 | implant | ワイドインプラント | わいどいんぷらんと | wide implant | 宽种植体 | true |  |
| 97 | 候補 | implant | インプラント直径 | いんぷらんとちょっけい | implant diameter | 种植体直径 | true |  |
| 98 | 候補 | implant | インプラント長径 | いんぷらんとちょうけい | implant length | 种植体长度 | true |  |
| 99 | 候補 | implant | インプラント表面性状 | いんぷらんとひょうめんせいじょう | implant surface characteristics | 种植体表面特性 | false |  |
| 100 | 候補 | implant | 粗面 | そめん | rough surface | 粗糙表面 | false |  |
| 101 | 候補 | implant | 機械研磨面 | きかいけんまめん | machined surface | 机械加工表面 | false |  |
| 102 | 候補 | implant | 親水性表面 | しんすいせいひょうめん | hydrophilic surface | 亲水表面 | false |  |
| 103 | 候補 | implant | チタン | ちたん | titanium | 钛 | false |  |
| 104 | 候補 | implant | チタン合金 | ちたんごうきん | titanium alloy | 钛合金 | false |  |
| 105 | 候補 | implant | ジルコニアインプラント | じるこにあいんぷらんと | zirconia implant | 氧化锆种植体 | false |  |
| 106 | 候補 | implant | プラットフォーム | ぷらっとふぉーむ | platform | 平台 | false |  |
| 107 | 候補 | implant | コネクション | こねくしょん | connection | 连接 | false |  |
| 108 | 候補 | implant | インターナルコネクション | いんたーなるこねくしょん | internal connection | 内连接 | false |  |
| 109 | 候補 | implant | エクスターナルコネクション | えくすたーなるこねくしょん | external connection | 外连接 | false |  |
| 110 | 候補 | implant | モーステーパー | もーすてーぱー | Morse taper | 莫氏锥度 | false |  |
| 111 | 候補 | implant | インプラントアナログ | いんぷらんとあなろぐ | implant analog | 种植体替代体 | false |  |
| 112 | 候補 | surgery | 術前診査 | じゅつぜんしんさ | preoperative examination | 术前检查 | false |  |
| 113 | 候補 | surgery | 術前診断 | じゅつぜんしんだん | preoperative diagnosis | 术前诊断 | true |  |
| 114 | 候補 | surgery | 治療計画 | ちりょうけいかく | treatment planning | 治疗计划 | true |  |
| 115 | 候補 | surgery | 埋入計画 | まいにゅうけいかく | implant placement planning | 种植计划 | true |  |
| 116 | 候補 | surgery | 埋入位置 | まいにゅういち | implant position | 种植位置 | true |  |
| 117 | 候補 | surgery | 埋入深度 | まいにゅうしんど | implant placement depth | 植入深度 | true |  |
| 118 | 候補 | surgery | 埋入角度 | まいにゅうかくど | implant angulation | 植入角度 | true |  |
| 119 | 候補 | surgery | 補綴主導 | ほてつしゅどう | prosthetically driven | 修复导向 | false |  |
| 120 | 候補 | surgery | トップダウントリートメント | とっぷだうんとりーとめんと | top-down treatment | 自上而下治疗 | false |  |
| 121 | 候補 | surgery | 安全域 | あんぜんいき | safety zone | 安全区 | true |  |
| 122 | 候補 | surgery | 抜歯窩 | ばっしか | extraction socket | 拔牙窝 | false |  |
| 123 | 候補 | surgery | 新鮮抜歯窩 | しんせんばっしか | fresh extraction socket | 新鲜拔牙窝 | false |  |
| 124 | 候補 | surgery | ソケットプリザベーション | そけっとぷりざべーしょん | socket preservation | 拔牙窝保存 | false |  |
| 125 | 候補 | surgery | リッジプリザベーション | りっじぷりざべーしょん | ridge preservation | 牙槽嵴保存 | false |  |
| 126 | 候補 | surgery | 低侵襲 | ていしんしゅう | minimally invasive | 微创 | false |  |
| 127 | 候補 | surgery | 全層弁 | ぜんそうべん | full-thickness flap | 全厚瓣 | false |  |
| 128 | 候補 | surgery | 部分層弁 | ぶぶんそうべん | partial-thickness flap | 半厚瓣 | false |  |
| 129 | 候補 | surgery | 歯肉切開 | しにくせっかい | gingival incision | 牙龈切开 | true |  |
| 130 | 候補 | surgery | 縦切開 | じゅうせっかい | vertical incision | 纵切口 | true |  |
| 131 | 候補 | surgery | 減張切開 | げんちょうせっかい | releasing incision | 减张切口 | true |  |
| 132 | 候補 | surgery | 骨膜減張切開 | こつまくげんちょうせっかい | periosteal releasing incision | 骨膜减张切口 | true |  |
| 133 | 候補 | surgery | 粘膜骨膜弁 | ねんまくこつまくべん | mucoperiosteal flap | 黏骨膜瓣 | false |  |
| 134 | 候補 | surgery | 骨切削 | こつせっさく | bone drilling / osteotomy | 骨切削 | true |  |
| 135 | 候補 | surgery | 注水 | ちゅうすい | irrigation | 冲洗 | false |  |
| 136 | 候補 | surgery | 発熱 | はつねつ | heat generation | 产热 | true |  |
| 137 | 候補 | surgery | オーバーヒート | おーばーひーと | overheating | 过热 | true |  |
| 138 | 候補 | surgery | タッピング | たっぴんぐ | tapping | 攻丝 | false |  |
| 139 | 候補 | surgery | カウンターシンク | かうんたーしんく | countersink | 扩颈钻 | false |  |
| 140 | 候補 | surgery | 骨質 | こつしつ | bone quality | 骨质 | true |  |
| 141 | 候補 | surgery | 骨量 | こつりょう | bone volume | 骨量 | true |  |
| 142 | 候補 | surgery | 骨幅 | こつはば | bone width | 骨宽度 | true |  |
| 143 | 候補 | surgery | 骨高径 | こつこうけい | bone height | 骨高度 | true |  |
| 144 | 候補 | surgery | 皮質骨 | ひしつこつ | cortical bone | 皮质骨 | true |  |
| 145 | 候補 | surgery | 海綿骨 | かいめんこつ | cancellous bone | 松质骨 | true |  |
| 146 | 候補 | surgery | 硬骨 | こうこつ | dense bone | 致密骨 | true |  |
| 147 | 候補 | surgery | 軟骨 | なんこつ | soft bone | 软骨质 | true |  |
| 148 | 候補 | surgery | ドリリングシークエンス | どりりんぐしーくえんす | drilling sequence | 备孔顺序 | true |  |
| 149 | 候補 | surgery | アンダープリパレーション | あんだーぷりぱれーしょん | underpreparation | 欠预备 | true |  |
| 150 | 候補 | surgery | オーバープリパレーション | おーばーぷりぱれーしょん | overpreparation | 过度预备 | true |  |
| 151 | 候補 | surgery | 骨圧縮 | こつあっしゅく | bone condensation | 骨压缩 | true |  |
| 152 | 候補 | surgery | オステオトーム | おすておとーむ | osteotome | 骨凿 | false |  |
| 153 | 候補 | surgery | 初期閉鎖 | しょきへいさ | primary closure | 一期关闭 | false |  |
| 154 | 候補 | surgery | 二次手術 | にじしゅじゅつ | second-stage surgery | 二期手术 | false |  |
| 155 | 候補 | surgery | ヒーリングアバットメント | ひーりんぐあばっとめんと | healing abutment | 愈合基台 | false |  |
| 156 | 候補 | surgery | カバースクリュー | かばーすくりゅー | cover screw | 覆盖螺丝 | false |  |
| 157 | 候補 | surgery | 一回法 | いっかいほう | one-stage protocol | 一期法 | false |  |
| 158 | 候補 | surgery | 二回法 | にかいほう | two-stage protocol | 二期法 | false |  |
| 159 | 候補 | bone | 水平的骨造成 | すいへいてきこつぞうせい | horizontal bone augmentation | 水平骨增量 | false |  |
| 160 | 候補 | bone | 垂直的骨造成 | すいちょくてきこつぞうせい | vertical bone augmentation | 垂直骨增量 | true |  |
| 161 | 候補 | bone | 水平的骨欠損 | すいへいてきこつけっそん | horizontal bone defect | 水平骨缺损 | true |  |
| 162 | 候補 | bone | 垂直的骨欠損 | すいちょくてきこつけっそん | vertical bone defect | 垂直骨缺损 | true |  |
| 163 | 候補 | bone | 骨欠損 | こつけっそん | bone defect | 骨缺损 | true |  |
| 164 | 候補 | bone | 骨移植 | こついしょく | bone grafting | 骨移植 | false |  |
| 165 | 候補 | bone | ブロック骨移植 | ぶろっくこついしょく | block bone graft | 块状骨移植 | false |  |
| 166 | 候補 | bone | 粉砕骨 | ふんさいこつ | particulate bone | 颗粒骨 | false |  |
| 167 | 候補 | bone | 骨片 | こっぺん | bone fragment | 骨片 | false |  |
| 168 | 候補 | bone | 骨採取 | こつさいしゅ | bone harvesting | 取骨 | false |  |
| 169 | 候補 | bone | 骨採取部位 | こつさいしゅぶい | bone harvesting site | 取骨部位 | true |  |
| 170 | 候補 | bone | 腸骨 | ちょうこつ | iliac bone | 髂骨 | true |  |
| 171 | 候補 | bone | 下顎枝 | かがくし | mandibular ramus | 下颌升支 | true |  |
| 172 | 候補 | bone | オトガイ部 | おとがいぶ | chin region | 颏部 | true |  |
| 173 | 候補 | bone | 骨スクレーパー | こつすくれーぱー | bone scraper | 刮骨器 | false |  |
| 174 | 候補 | bone | 骨ミル | こつみる | bone mill | 骨磨 | false |  |
| 175 | 候補 | bone | 骨膜 | こつまく | periosteum | 骨膜 | true |  |
| 176 | 候補 | bone | 骨形成 | こつけいせい | bone formation | 骨形成 | false |  |
| 177 | 候補 | bone | 骨伝導 | こつでんどう | osteoconduction | 骨传导 | false |  |
| 178 | 候補 | bone | 骨誘導 | こつゆうどう | osteoinduction | 骨诱导 | false |  |
| 179 | 候補 | bone | 骨置換 | こつちかん | bone substitution | 骨替代 | false |  |
| 180 | 候補 | bone | 骨成熟 | こつせいじゅく | bone maturation | 骨成熟 | false |  |
| 181 | 候補 | bone | 骨リモデリング | こつりもでりんぐ | bone remodeling | 骨重建 | false |  |
| 182 | 候補 | bone | メンブレン固定 | めんぶれんこてい | membrane fixation | 屏障膜固定 | false |  |
| 183 | 候補 | bone | 固定スクリュー | こていすくりゅー | fixation screw | 固定螺钉 | false |  |
| 184 | 候補 | bone | チタンメッシュ | ちたんめっしゅ | titanium mesh | 钛网 | false |  |
| 185 | 候補 | bone | ピン固定 | ぴんこてい | pin fixation | 钉固定 | false |  |
| 186 | 候補 | bone | スペースメイキング | すぺーすめいきんぐ | space making | 空间维持 | false |  |
| 187 | 候補 | bone | 遮蔽膜 | しゃへいまく | barrier membrane | 屏障膜 | false |  |
| 188 | 候補 | bone | コラーゲン膜 | こらーげんまく | collagen membrane | 胶原膜 | false |  |
| 189 | 候補 | sinus | 上顎洞底 | じょうがくどうてい | maxillary sinus floor | 上颌窦底 | true |  |
| 190 | 候補 | sinus | 上顎洞側壁 | じょうがくどうそくへき | lateral wall of maxillary sinus | 上颌窦侧壁 | true |  |
| 191 | 候補 | sinus | ラテラルアプローチ | らてらるあぷろーち | lateral approach | 侧壁入路 | true |  |
| 192 | 候補 | sinus | クレスタルアプローチ | くれすたるあぷろーち | crestal approach | 牙槽嵴顶入路 | true |  |
| 193 | 候補 | sinus | 上顎洞隔壁 | じょうがくどうかくへき | sinus septum | 上颌窦隔 | true |  |
| 194 | 候補 | sinus | 上顎洞炎 | じょうがくどうえん | maxillary sinusitis | 上颌窦炎 | true |  |
| 195 | 候補 | sinus | 洞粘膜挙上 | どうねんまくきょじょう | sinus membrane elevation | 窦黏膜提升 | true |  |
| 196 | 候補 | sinus | 洞底骨 | どうていこつ | sinus floor bone | 窦底骨 | true |  |
| 197 | 候補 | sinus | 側方開窓 | そくほうかいそう | lateral window | 侧壁开窗 | true |  |
| 198 | 候補 | sinus | 骨窓 | こつそう | bony window | 骨窗 | true |  |
| 199 | 候補 | sinus | 洞内迷入 | どうないめいにゅう | displacement into the sinus | 误入窦腔 | true |  |
| 200 | 候補 | soft | 角化粘膜 | かくかねんまく | keratinized mucosa | 角化黏膜 | false |  |
| 201 | 候補 | soft | 付着歯肉 | ふちゃくしにく | attached gingiva | 附着龈 | false |  |
| 202 | 候補 | soft | 可動粘膜 | かどうねんまく | movable mucosa | 可动黏膜 | false |  |
| 203 | 候補 | soft | 粘膜厚径 | ねんまくこうけい | mucosal thickness | 黏膜厚度 | true |  |
| 204 | 候補 | soft | 軟組織 | なんそしき | soft tissue | 软组织 | false |  |
| 205 | 候補 | soft | 軟組織移植 | なんそしきいしょく | soft tissue graft | 软组织移植 | false |  |
| 206 | 候補 | soft | 結合組織移植 | けつごうそしきいしょく | connective tissue graft | 结缔组织移植 | false |  |
| 207 | 候補 | soft | 遊離歯肉移植 | ゆうりしにくいしょく | free gingival graft | 游离龈移植 | false |  |
| 208 | 候補 | soft | 歯肉増大術 | しにくぞうだいじゅつ | gingival augmentation | 牙龈增量术 | false |  |
| 209 | 候補 | soft | 歯肉退縮 | しにくたいしゅく | gingival recession | 牙龈退缩 | true |  |
| 210 | 候補 | soft | 粘膜貫通部 | ねんまくかんつうぶ | transmucosal area | 穿黏膜区域 | false |  |
| 211 | 候補 | soft | エマージェンスプロファイル | えまーじぇんすぷろふぁいる | emergence profile | 穿龈轮廓 | false |  |
| 212 | 候補 | soft | 歯肉縁 | しにくえん | gingival margin | 龈缘 | true |  |
| 213 | 候補 | soft | 歯間乳頭 | しかんにゅうとう | interdental papilla | 牙间乳头 | false |  |
| 214 | 候補 | soft | 乳頭再建 | にゅうとうさいけん | papilla reconstruction | 乳头重建 | false |  |
| 215 | 候補 | soft | 創傷治癒 | そうしょうちゆ | wound healing | 创伤愈合 | false |  |
| 216 | 候補 | prosthetics | 補綴装置 | ほてつそうち | prosthetic appliance | 修复装置 | false |  |
| 217 | 候補 | prosthetics | 上部構造装着 | じょうぶこうぞうそうちゃく | superstructure delivery | 上部结构戴入 | false |  |
| 218 | 候補 | prosthetics | 最終補綴 | さいしゅうほてつ | final prosthesis | 最终修复 | false |  |
| 219 | 候補 | prosthetics | 単冠 | たんかん | single crown | 单冠 | false |  |
| 220 | 候補 | prosthetics | ブリッジ | ぶりっじ | bridge | 桥 | false |  |
| 221 | 候補 | prosthetics | インプラントブリッジ | いんぷらんとぶりっじ | implant bridge | 种植桥 | false |  |
| 222 | 候補 | prosthetics | オーバーデンチャー | おーばーでんちゃー | overdenture | 覆盖义齿 | false |  |
| 223 | 候補 | prosthetics | アタッチメント | あたっちめんと | attachment | 附着体 | false |  |
| 224 | 候補 | prosthetics | ロケーター | ろけーたー | locator attachment | Locator附着体 | false |  |
| 225 | 候補 | prosthetics | バーアタッチメント | ばーあたっちめんと | bar attachment | 杆卡附着体 | false |  |
| 226 | 候補 | prosthetics | ボールアタッチメント | ぼーるあたっちめんと | ball attachment | 球帽附着体 | false |  |
| 227 | 候補 | prosthetics | 印象ポスト | いんしょうぽすと | impression post | 印模杆 | false |  |
| 228 | 候補 | prosthetics | オープントレー法 | おーぷんとれーほう | open tray technique | 开窗托盘法 | false |  |
| 229 | 候補 | prosthetics | クローズドトレー法 | くろーずどとれーほう | closed tray technique | 闭口托盘法 | false |  |
| 230 | 候補 | prosthetics | 咬合採得 | こうごうさいとく | bite registration | 咬合记录 | false |  |
| 231 | 候補 | prosthetics | 咬合高径 | こうごうこうけい | vertical dimension of occlusion | 咬合垂直距离 | true |  |
| 232 | 候補 | prosthetics | 上部構造設計 | じょうぶこうぞうせっけい | superstructure design | 上部结构设计 | false |  |
| 233 | 候補 | prosthetics | カスタムアバットメント | かすたむあばっとめんと | custom abutment | 个性化基台 | false |  |
| 234 | 候補 | prosthetics | 既製アバットメント | きせいあばっとめんと | prefabricated abutment | 预成基台 | false |  |
| 235 | 候補 | prosthetics | チタンベース | ちたんべーす | titanium base | 钛基底 | false |  |
| 236 | 候補 | prosthetics | セメントリテイン | せめんとりていん | cement-retained | 粘接固位 | true |  |
| 237 | 候補 | prosthetics | スクリューリテイン | すくりゅーりていん | screw-retained | 螺丝固位 | true |  |
| 238 | 候補 | prosthetics | 余剰セメント | よじょうせめんと | excess cement | 多余粘接剂 | true |  |
| 239 | 候補 | prosthetics | 締結トルク | ていけつとるく | tightening torque | 拧紧扭矩 | true |  |
| 240 | 候補 | prosthetics | トルクレンチ | とるくれんち | torque wrench | 扭矩扳手 | false |  |
| 241 | 候補 | prosthetics | 仮締め | かりじめ | provisional tightening | 临时拧紧 | false |  |
| 242 | 候補 | prosthetics | 本締め | ほんじめ | final tightening | 最终拧紧 | true |  |
| 243 | 候補 | prosthetics | 再締結 | さいていけつ | retightening | 再次拧紧 | false |  |
| 244 | 候補 | occlusion | 咬合 | こうごう | occlusion | 咬合 | true |  |
| 245 | 候補 | occlusion | 咬合接触 | こうごうせっしょく | occlusal contact | 咬合接触 | true |  |
| 246 | 候補 | occlusion | 早期接触 | そうきせっしょく | premature contact | 早接触 | true |  |
| 247 | 候補 | occlusion | 咬合干渉 | こうごうかんしょう | occlusal interference | 咬合干扰 | true |  |
| 248 | 候補 | occlusion | 側方運動 | そくほううんどう | lateral movement | 侧方运动 | false |  |
| 249 | 候補 | occlusion | 前方運動 | ぜんぽううんどう | protrusive movement | 前伸运动 | false |  |
| 250 | 候補 | occlusion | 中心咬合位 | ちゅうしんこうごうい | centric occlusion | 正中咬合位 | true |  |
| 251 | 候補 | occlusion | 咬頭嵌合位 | こうとうかんごうい | maximum intercuspation | 最大牙尖交错位 | true |  |
| 252 | 候補 | occlusion | 咬合調整 | こうごうちょうせい | occlusal adjustment | 咬合调整 | true |  |
| 253 | 候補 | occlusion | パラファンクション | ぱらふぁんくしょん | parafunction | 副功能 | false |  |
| 254 | 候補 | occlusion | ブラキシズム | ぶらきしずむ | bruxism | 磨牙症 | true |  |
| 255 | 候補 | occlusion | ナイトガード | ないとがーど | night guard | 夜磨牙垫 | false |  |
| 256 | 候補 | anatomy | 下顎管 | かがくかん | mandibular canal | 下颌管 | true |  |
| 257 | 候補 | anatomy | オトガイ神経 | おとがいしんけい | mental nerve | 颏神经 | true |  |
| 258 | 候補 | anatomy | 切歯管 | せっしかん | incisive canal | 切牙管 | true |  |
| 259 | 候補 | anatomy | 鼻腔底 | びくうてい | nasal floor | 鼻腔底 | true |  |
| 260 | 候補 | anatomy | 口蓋側 | こうがいそく | palatal side | 腭侧 | true |  |
| 261 | 候補 | anatomy | 顎堤 | がくてい | alveolar ridge | 牙槽嵴 | false |  |
| 262 | 候補 | anatomy | 無歯顎 | むしがく | edentulous jaw | 无牙颌 | false |  |
| 263 | 候補 | anatomy | 部分欠損 | ぶぶんけっそん | partial edentulism | 部分缺牙 | false |  |
| 264 | 候補 | anatomy | 遊離端欠損 | ゆうりたんけっそん | free-end edentulism | 游离端缺失 | true |  |
| 265 | 候補 | anatomy | 中間欠損 | ちゅうかんけっそん | bounded edentulous space | 中间缺失 | false |  |
| 266 | 候補 | anatomy | 隣在歯 | りんざいし | adjacent tooth | 邻牙 | true |  |
| 267 | 候補 | anatomy | 対合歯 | たいごうし | opposing tooth | 对颌牙 | true |  |
| 268 | 候補 | complication | インプラント喪失 | いんぷらんとそうしつ | implant loss | 种植体丧失 | true |  |
| 269 | 候補 | complication | 早期失敗 | そうきしっぱい | early failure | 早期失败 | true |  |
| 270 | 候補 | complication | 晩期失敗 | ばんきしっぱい | late failure | 晚期失败 | true |  |
| 271 | 候補 | complication | 術後感染 | じゅつごかんせん | postoperative infection | 术后感染 | true |  |
| 272 | 候補 | complication | 出血 | しゅっけつ | bleeding | 出血 | true |  |
| 273 | 候補 | complication | 腫脹 | しゅちょう | swelling | 肿胀 | true |  |
| 274 | 候補 | complication | 疼痛 | とうつう | pain | 疼痛 | true |  |
| 275 | 候補 | complication | 知覚鈍麻 | ちかくどんま | hypoesthesia | 感觉减退 | true |  |
| 276 | 候補 | complication | 知覚異常 | ちかくいじょう | paresthesia | 感觉异常 | true |  |
| 277 | 候補 | complication | 神経損傷 | しんけいそんしょう | nerve injury | 神经损伤 | true |  |
| 278 | 候補 | complication | 骨壊死 | こつえし | bone necrosis | 骨坏死 | true |  |
| 279 | 候補 | complication | 創離開 | そうりかい | wound dehiscence | 创口裂开 | true |  |
| 280 | 候補 | complication | メンブレン露出 | めんぶれんろしゅつ | membrane exposure | 屏障膜暴露 | true |  |
| 281 | 候補 | complication | インプラント破折 | いんぷらんとはせつ | implant fracture | 种植体折断 | true |  |
| 282 | 候補 | complication | アバットメント破折 | あばっとめんとはせつ | abutment fracture | 基台折断 | true |  |
| 283 | 候補 | complication | スクリュー破折 | すくりゅーはせつ | screw fracture | 螺丝折断 | true |  |
| 284 | 候補 | complication | 上部構造破損 | じょうぶこうぞうはそん | superstructure fracture | 上部结构破损 | true |  |
| 285 | 候補 | maintenance | メインテナンス | めいんてなんす | maintenance | 维护 | false |  |
| 286 | 候補 | maintenance | リコール | りこーる | recall visit | 复查 | false |  |
| 287 | 候補 | maintenance | プラークコントロール | ぷらーくこんとろーる | plaque control | 菌斑控制 | false |  |
| 288 | 候補 | maintenance | プロービング | ぷろーびんぐ | probing | 探诊 | false |  |
| 289 | 候補 | maintenance | プロービングデプス | ぷろーびんぐでぷす | probing depth | 探诊深度 | true |  |
| 290 | 候補 | maintenance | 出血指数 | しゅっけつしすう | bleeding index | 出血指数 | true |  |
| 291 | 候補 | maintenance | 排膿 | はいのう | suppuration | 溢脓 | true |  |
| 292 | 候補 | maintenance | インプラント周囲ポケット | いんぷらんとしゅういぽけっと | peri-implant pocket | 种植体周围袋 | true |  |
| 293 | 候補 | maintenance | デブライドメント | でぶらいどめんと | debridement | 清创 | false |  |
| 294 | 候補 | maintenance | エアアブレージョン | えああぶれーじょん | air abrasion | 喷砂 | false |  |
| 295 | 候補 | digital | デジタルワックスアップ | でじたるわっくすあっぷ | digital wax-up | 数字化蜡型 | false |  |
| 296 | 候補 | digital | バーチャルセットアップ | ばーちゃるせっとあっぷ | virtual setup | 虚拟排牙 | false |  |
| 297 | 候補 | digital | プランニングソフト | ぷらんにんぐそふと | planning software | 计划软件 | false |  |
| 298 | 候補 | digital | シミュレーション | しみゅれーしょん | simulation | 模拟 | false |  |
| 299 | 候補 | digital | DICOM | だいこむ | DICOM | DICOM | false |  |
| 300 | 候補 | digital | STLデータ | えすてぃーえるでーた | STL data | STL数据 | false |  |
