// University name translations cache
// { [normalized_name]: { en: 'English Name', zh: 'Chinese Name' } }
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

export function getUniversityName(normalized_name, lang = 'en') {
    if (
        universityNameTranslations[normalized_name] &&
        universityNameTranslations[normalized_name][lang]
    ) {
        return universityNameTranslations[normalized_name][lang];
    }
    // fallback: return normalized_name if not found
    return normalized_name;
}

export default universityNameTranslations;
