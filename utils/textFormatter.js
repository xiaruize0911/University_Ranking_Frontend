/**
 * Utility function to format database-style text with underscores 
 * into user-friendly display text with proper capitalization
 */

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

    // Special handling for common stats
    const specialCases = {
        'total_students': 'Total Students',
        'student_faculty_ratio': 'Student Faculty Ratio',
        'international_students': 'International Students',
        'female_students': 'Female Students',
        'male_students': 'Male Students',
        'undergraduate_students': 'Undergraduate Students',
        'graduate_students': 'Graduate Students',
        'research_output': 'Research Output',
        'citation_impact': 'Citation Impact'
    };

    // Check if it matches a special case
    if (specialCases[statsType]) {
        return specialCases[statsType];
    }

    // Otherwise use the general formatter
    return formatDisplayText(statsType);
}
