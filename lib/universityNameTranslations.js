// University name translations cache
// { [normalized_name]: { en: 'English Name', zh: 'Chinese Name' } }
import { formatUniversityName } from "../utils/textFormatter";
const universityNameTranslations = {};

export function setUniversityNameTranslations(data) {
    // data: Array<{ normalized_name, name, chinese_name }>
    data.forEach(u => {
        universityNameTranslations[u.normalized_name] = {
            en: u.name,
            zh: u.chinese_name || u.name
        };
    });
}

const special_cases = { 'ucl': { en: 'University College London', zh: '伦敦大学学院' } };

export function getUniversityName(normalized_name, lang = 'en') {
    if (special_cases[normalized_name] && special_cases[normalized_name][lang]) {
        return special_cases[normalized_name][lang];
    }
    // console.log(normalized_name, lang);
    // console.log(universityNameTranslations);
    if (
        universityNameTranslations[normalized_name] &&
        universityNameTranslations[normalized_name][lang]
    ) {
        return universityNameTranslations[normalized_name][lang];
    }
    // fallback: return normalized_name if not found
    return formatUniversityName(normalized_name);
}

export default universityNameTranslations;
