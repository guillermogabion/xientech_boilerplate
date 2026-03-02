// server/src/utils/stringUtils.js

const getAbbreviation = (name, style = 'SHORT') => {
    if (!name) return "";
    const parts = name.trim().split(' ');
    const number = parts.length > 1 && !isNaN(parts[parts.length - 1]) ? parts[parts.length - 1] : "";

    switch (style) {
        case 'TRADITIONAL': // Returns "PUR1"
            return `${parts[0].substring(0, 3)}${number}`.toUpperCase();
        case 'SHORT': // Returns "P1"
        default:
            return `${parts[0][0]}${number}`.toUpperCase();
    }
};

// Use CommonJS export instead of 'export const'
module.exports = { getAbbreviation };