import React, { useEffect, useState } from "react";

const FONT_CLASSES = [
  "font-serif",
  "font-sans",
  "font-instrument-serif",
  "font-source-serif",
  "font-helvetica-italic",
] as const;

type FontClass = (typeof FONT_CLASSES)[number];
type IntroItem =
  | { kind: "character"; character: string; font: FontClass }
  | { kind: "code"; characters: string; font: FontClass }
  | { kind: "coffee" };
type IntroOperation =
  | { kind: "character"; character: string }
  | { kind: "coffee" }
  | { kind: "braces" }
  | { kind: "code"; character: string };
type IntroPhrase = { label: string; operations: IntroOperation[] };
type DisplayedIntro = { label: string; items: IntroItem[] };

const characterOperations = (text: string): IntroOperation[] =>
  Array.from(text, (character) => ({ kind: "character", character }));

const INTRO_PHRASES: IntroPhrase[] = [
  {
    label: "Espresso coffee yourself in {CODE}",
    operations: [
      ...characterOperations("Espresso "),
      { kind: "coffee" },
      ...characterOperations(" yourself in "),
      { kind: "braces" },
      ...Array.from(
        "CODE",
        (character) => ({ kind: "code", character } as const)
      ),
    ],
  },
  {
    label: "Coffee. Code. Create.",
    operations: [{ kind: "coffee" }, ...characterOperations(". Code. Create.")],
  },
];

const renderIntro = (
  phrase: IntroPhrase,
  progress: number,
  font: FontClass
): IntroItem[] => {
  const items: IntroItem[] = [];

  phrase.operations.slice(0, progress).forEach((operation) => {
    if (operation.kind === "coffee") {
      items.push({ kind: "coffee" });
      return;
    }

    if (operation.kind === "braces") {
      items.push({ kind: "code", characters: "", font });
      return;
    }

    if (operation.kind === "code") {
      const codeItem = items.find(
        (item): item is Extract<IntroItem, { kind: "code" }> =>
          item.kind === "code"
      );

      if (codeItem) codeItem.characters += operation.character;
      return;
    }

    items.push({
      kind: "character",
      character: operation.character,
      font,
    });
  });

  return items;
};

const randomFontAfter = (current: FontClass): FontClass => {
  const choices = FONT_CLASSES.filter((font) => font !== current);
  return choices[Math.floor(Math.random() * choices.length)] ?? FONT_CLASSES[0];
};

const isSpaceOperation = (operation: IntroOperation | undefined): boolean =>
  operation?.kind === "character" && operation.character === " ";

export const IntroHero = () => {
  const [displayedIntro, setDisplayedIntro] = useState<DisplayedIntro>(() => ({
    label: INTRO_PHRASES[0].label,
    items: renderIntro(
      INTRO_PHRASES[0],
      INTRO_PHRASES[0].operations.length,
      FONT_CLASSES[0]
    ),
  }));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer = 0;
    let phraseIndex = 0;
    let progress = INTRO_PHRASES[0].operations.length;
    let font: FontClass = FONT_CLASSES[0];

    const schedule = (
      callback: () => void,
      min: number,
      max: number = min
    ): void => {
      timer = window.setTimeout(callback, min + Math.random() * (max - min));
    };

    const step = (deleting: boolean): void => {
      const phrase = INTRO_PHRASES[phraseIndex];
      progress += deleting ? -1 : 1;
      setDisplayedIntro({
        label: phrase.label,
        items: renderIntro(phrase, progress, font),
      });

      if (deleting && progress > 0) {
        const pause = isSpaceOperation(phrase.operations[progress - 1])
          ? 70
          : 0;
        schedule(() => step(true), 35 + pause, 90 + pause);
      } else if (deleting) {
        phraseIndex = (phraseIndex + 1) % INTRO_PHRASES.length;
        font = randomFontAfter(font);
        setDisplayedIntro({
          label: INTRO_PHRASES[phraseIndex].label,
          items: [],
        });
        schedule(() => step(false), 1800);
      } else if (progress < phrase.operations.length) {
        const wordPause = isSpaceOperation(phrase.operations[progress - 1])
          ? 100
          : 0;
        const hesitation = Math.random() < 0.15 ? 100 + Math.random() * 300 : 0;
        schedule(
          () => step(false),
          35 + wordPause + hesitation,
          90 + wordPause + hesitation
        );
      } else {
        schedule(() => step(true), 4000);
      }
    };

    schedule(() => step(true), 4000);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="hero-viewport flex bg-[#F6FDFC] px-5 text-center sm:px-8">
      <h1
        aria-label={displayedIntro.label}
        className="typewriter-line flex h-full w-full items-center text-[clamp(3rem,8vw,9rem)] font-normal leading-[0.92] tracking-[-0.055em]"
      >
        <span aria-hidden="true" className="block w-full">
          {displayedIntro.items.map((item, index) => (
            <React.Fragment key={index}>
              {item.kind === "coffee" ? (
                <span className="typewriter-coffee">
                  <img src="/coffee1.png" alt="" />
                </span>
              ) : item.kind === "code" ? (
                <span className="inline-block whitespace-nowrap">
                  <span className={item.font}>{`{${item.characters}`}</span>
                  <span className="typewriter-cursor" />
                  <span className={item.font}>{"}"}</span>
                </span>
              ) : (
                <span className={item.font}>{item.character}</span>
              )}
            </React.Fragment>
          ))}
          {!displayedIntro.items.some((item) => item.kind === "code") && (
            <span className="typewriter-cursor" />
          )}
        </span>
      </h1>
    </section>
  );
};
