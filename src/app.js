const phrases = [
  {
    scene: "reception",
    ja: "今日はどのような症状で来院されましたか？",
    en: "What symptoms brought you to the clinic today?",
    zh: "您今天因为什么症状来就诊？",
    ko: "오늘은 어떤 증상으로 내원하셨나요?",
  },
  {
    scene: "medicalInterview",
    ja: "痛みはいつからありますか？",
    en: "When did the pain start?",
    zh: "疼痛是从什么时候开始的？",
    ko: "통증은 언제부터 있었나요?",
  },
  {
    scene: "treatment",
    ja: "これからレントゲン写真を撮影します。",
    en: "We will take an X-ray now.",
    zh: "接下来我们要拍摄X光片。",
    ko: "이제 엑스레이 촬영을 하겠습니다.",
  },
  {
    scene: "treatment",
    ja: "麻酔をしてから治療を始めます。",
    en: "We will start treatment after applying anesthesia.",
    zh: "我们会先进行麻醉，然后开始治疗。",
    ko: "마취를 한 뒤 치료를 시작하겠습니다.",
  },
  {
    scene: "payment",
    ja: "本日のお会計はこちらです。",
    en: "This is the fee for today's visit.",
    zh: "这是今天的费用。",
    ko: "오늘 진료비는 이 금액입니다.",
  },
  {
    scene: "aftercare",
    ja: "麻酔が切れるまで食事は控えてください。",
    en: "Please avoid eating until the anesthesia wears off.",
    zh: "麻醉消退之前请避免进食。",
    ko: "마취가 풀릴 때까지 식사는 피해주세요.",
  },
];

const languageLabels = {
  en: "英語",
  zh: "中国語",
  ko: "韓国語",
};

const sceneLabels = {
  reception: "受付",
  medicalInterview: "問診",
  treatment: "治療説明",
  payment: "会計",
  aftercare: "術後説明",
};

const sceneSelect = document.querySelector("#scene");
const targetLanguageSelect = document.querySelector("#targetLanguage");
const sourceText = document.querySelector("#sourceText");
const resultText = document.querySelector("#resultText");
const resultMeta = document.querySelector("#resultMeta");
const phraseList = document.querySelector("#phraseList");
const translateButton = document.querySelector("#translateButton");
const clearButton = document.querySelector("#clearButton");

function findDemoTranslation(text, language) {
  const normalizedText = text.trim();
  const exactMatch = phrases.find((phrase) => phrase.ja === normalizedText);

  if (exactMatch) {
    return exactMatch[language];
  }

  if (!normalizedText) {
    return "翻訳する文章を入力してください。";
  }

  return `デモ翻訳: ${normalizedText}`;
}

function updateResult() {
  const language = targetLanguageSelect.value;
  const scene = sceneSelect.value;
  resultText.textContent = findDemoTranslation(sourceText.value, language);
  resultMeta.textContent = `${languageLabels[language]} / ${sceneLabels[scene]}`;
}

function renderPhrases() {
  phraseList.innerHTML = "";

  phrases.forEach((phrase) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "phrase-button";
    button.textContent = phrase.ja;
    button.addEventListener("click", () => {
      sourceText.value = phrase.ja;
      sceneSelect.value = phrase.scene;
      updateResult();
    });
    phraseList.appendChild(button);
  });
}

translateButton.addEventListener("click", updateResult);
targetLanguageSelect.addEventListener("change", updateResult);
sceneSelect.addEventListener("change", updateResult);
clearButton.addEventListener("click", () => {
  sourceText.value = "";
  updateResult();
  sourceText.focus();
});

renderPhrases();
updateResult();
