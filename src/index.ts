import pd from "probability-distributions";

/** Whether two strings have at least one common character */
function intersect(str1: string, str2: string): boolean {
    let i1 = str1.length;
    while (i1--) {
        const c1 = str1.charAt(i1);

        let i2 = str2.length;
        while (i2--) {
            const c2 = str2.charAt(i2);
            if (c1 === c2) {
                return true;
            }
        }
    }
    return false;
}

const vowels = "aeiou";
const consonants = "bcdfghjklmnpqrstvwxyz";

function isValidSyllable(syllable: string): boolean {
    return intersect(syllable, vowels) && intersect(syllable, consonants);
}

function splitSyllables(word: string): string[] {
    for (let i = 0; i < word.length - 1; i++) {
        const prefix = word.substring(0, i);
        const suffix = word.substring(i);
        if (isValidSyllable(prefix)) {
            return [prefix].concat(splitSyllables(suffix));
        }
    }
    return [word];
}

function poisson1based(expectation: number): number {
    return pd.rpois(1, expectation - 1)[0] + 1;
}

/** Creates a name generator from a provided list of names */
export function createNameGenerator(names: string[]): () => string {
    // Total amount of words in all names
    let sumWordAmount = 0;
    // Total syllables in all names
    let sumSyllableAmount = 0;
    // Syllables used in provided names, with total count in all names
    let syllableCounts: { [index: string]: number } = {};

    for (const name of names) {
        const words = name.split(" ");
        sumWordAmount += words.length;
        for (let w of words) {
            w = w.toLowerCase();

            const syllables = splitSyllables(w);
            sumSyllableAmount += syllables.length;

            for (let s of syllables) {
                if (s in syllableCounts) {
                    syllableCounts[s] = syllableCounts[s] + 1;
                } else {
                    syllableCounts[s] = 1;
                }
            }
        }
    }

    // Average words per name
    const avgWordsAmount = sumWordAmount / names.length;
    // Average syllables per word
    const avgSyllableAmount = sumSyllableAmount / sumWordAmount;
    // Syllables, with probability of usage
    let syllableProbabilities: { [index: string]: number } = {};

    for (const syllable in syllableCounts) {
        syllableProbabilities[syllable] = syllableCounts[syllable] / sumSyllableAmount;
    }

    const randomSyllable = (): string => {
        let mass = 1;
        for (const syllable in syllableProbabilities) {
            const p = syllableProbabilities[syllable];
            if (Math.random() < (p / mass)) {
                return syllable;
            }
            mass = mass - p;
        }
        return "";
    };

    const randomWord = (): string => {
        const syllableAmount = poisson1based(avgSyllableAmount);
        let result = "";
        for (let i = 0; i < syllableAmount; i++) {
            result += randomSyllable();
        }
        return result;
    }

    return (): string => {
        const wordAmount = poisson1based(avgWordsAmount);
        let words: string[] = [];
        for (let i = 0; i < wordAmount; i++) {
            let word = randomWord();
            // capitalize
            word = word.charAt(0).toUpperCase() + word.slice(1);
            words.push(word);
        }
        return words.join(" ");
    }
}