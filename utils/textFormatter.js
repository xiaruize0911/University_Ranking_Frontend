/**
 * Utility function to format database-style text with underscores 
 * into user-friendly display text with proper capitalization
 */

import i18n from '../lib/i18n';

export function formatDisplayText(text) {
    if (!text || typeof text !== 'string') {
        return text;
    }

    // Replace underscores with spaces and capitalize each word
    return text
        .split('_')
        .map(word => {
            if (!word) return word;
            if (word.charAt(0) === word.charAt(0).toUpperCase()) {
                // If the word is already capitalized, keep it as is
                return word;
            }
            // Capitalize first letter and make rest lowercase
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
}

/**
 * Format source names with special handling for common abbreviations
 */
export function formatSourceName(source) {
    if (!source || typeof source !== 'string') {
        return source;
    }
    // console.log("Formatting source name:", source);

    // Check if there's a translation key for this source
    const translationKey = source.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (i18n.translations[i18n.locale] && i18n.translations[i18n.locale][translationKey]) {
        return i18n.t(translationKey);
    }

    // Special handling for common source names
    const specialCases = {
        'QS_World_University_Rankings': 'QS World University Rankings',
        'US_News_Global': 'US News Global',
        'US_News_best_global_universities_Rankings': 'US News Best Global Universities Rankings',
        'Times_Higher_Education': 'Times Higher Education',
        'Academic_Ranking_of_World_Universities': 'Academic Ranking of World Universities',
        'ARWU': 'ARWU'
    };

    // Check if it matches a special case
    if (specialCases[source]) {
        return specialCases[source];
    }

    // Otherwise use the general formatter
    return formatDisplayText(source);
}

/**
 * Format subject names with special handling for academic subjects
 */
export function formatSubjectName(subject) {
    if (!subject || typeof subject !== 'string') {
        return subject;
    }

    // Special handling for common subjects
    const specialCases = {
        'computer_science': 'Computer Science',
        'social_sciences': 'Social Sciences',
        'life_sciences': 'Life Sciences',
        'physical_sciences': 'Physical Sciences',
        'arts_humanities': 'Arts & Humanities',
        'clinical_medicine': 'Clinical Medicine',
        'engineering_technology': 'Engineering & Technology',
        'business_economics': 'Business & Economics'
    };

    // Check if it matches a special case
    if (specialCases[subject]) {
        return specialCases[subject];
    }

    // Otherwise use the general formatter
    return formatDisplayText(subject);
}

/**
 * Format stats types with special handling for academic statistics
 */
export function formatStatsType(statsType) {
    if (!statsType || typeof statsType !== 'string') {
        return statsType;
    }

    // Normalize the stats type key
    const normalizedKey = statsType.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');

    // Check if there's a translation key for this stats type
    if (i18n.translations[i18n.locale] && i18n.translations[i18n.locale][normalizedKey]) {
        return i18n.t(normalizedKey);
    }

    // Also try the original key format
    if (i18n.translations[i18n.locale] && i18n.translations[i18n.locale][statsType]) {
        return i18n.t(statsType);
    }

    // Special handling for common stats (fallback)
    const specialCases = {
        'total_students': 'Total Students',
        'student_faculty_ratio': 'Student Faculty Ratio',
        'international_students': 'International Students',
        'female_students': 'Female Students',
        'male_students': 'Male Students',
        'undergraduate_students': 'Undergraduate Students',
        'graduate_students': 'Graduate Students',
        'research_output': 'Research Output',
        'citation_impact': 'Citation Impact',
        'female_male_ratio': 'Female Male Ratio',
        'international_students_percentage': 'International Students Percentage',
        'academic_staff': 'Academic Staff',
        'administrative_staff': 'Administrative Staff',
        'total_staff': 'Total Staff',
        'endowment': 'Endowment',
        'tuition_fees': 'Tuition Fees',
        'acceptance_rate': 'Acceptance Rate',
        'graduation_rate': 'Graduation Rate',
        'total_number_of_students': 'Total Number of Students',
        'number_of_international_students': 'Number of International Students',
        'total_number_of_academic_staff': 'Total Number of Academic Staff',
        'number_of_international_staff': 'Number of International Staff',
        'number_of_undergraduate_degrees_awarded': 'Number of Undergraduate Degrees Awarded',
        'number_of_master_s_degrees_awarded': 'Number of Master\'s Degrees Awarded',
        'number_of_doctoral_degrees_awarded': 'Number of Doctoral Degrees Awarded',
        'number_of_research_only_staff': 'Number of Research Only Staff',
        'number_of_new_undergraduate_students': 'Number of New Undergraduate Students',
        'number_of_new_master_s_students': 'Number of New Master\'s Students',
        'number_of_new_doctoral_students': 'Number of New Doctoral Students'
    };

    // Check if it matches a special case
    if (specialCases[normalizedKey]) {
        return specialCases[normalizedKey];
    }

    // If no translation or special case found, try to format it nicely
    return formatDisplayText(statsType);
}
