class FunctionAnalyzer {
    constructor() {
        this.storageClasses = ['static', 'extern', 'auto', 'register'];
        this.typeQualifiers = ['const', 'volatile', 'restrict'];
    }

    parsePrototype(prototype) {
        prototype = prototype.replace(/;/g, '').trim();

        const match = prototype.match(/^(.*?)\s+(\**)(\w+)\s*\((.*?)\)$/);
        
        if (!match) {
            throw new Error('Invalid function prototype format');
        }

        const returnTypePart = match[1].trim();
        const pointerStars = match[2];
        const functionName = match[3];
        const parametersPart = match[4].trim();

        const returnTypeTokens = returnTypePart.split(/\s+/);
        const storageClass = returnTypeTokens.find(t => this.storageClasses.includes(t));
        const qualifiers = returnTypeTokens.filter(t => this.typeQualifiers.includes(t));
        const baseReturnType = returnTypeTokens.filter(t => 
            !this.storageClasses.includes(t) && !this.typeQualifiers.includes(t)
        ).join(' ');

        const fullReturnType = (baseReturnType + ' ' + pointerStars).trim();

        const parameters = this.parseParameters(parametersPart);

        return {
            functionName: functionName,
            returnType: fullReturnType,
            baseReturnType: baseReturnType,
            isPointer: pointerStars.length > 0,
            pointerLevel: pointerStars.length,
            storageClass: storageClass || null,
            qualifiers: qualifiers,
            parameters: parameters,
            parameterCount: parameters.length,
            rawPrototype: prototype
        };
    }

    parseParameters(paramString) {
        if (!paramString || paramString === 'void') {
            return [];
        }

        const params = [];
        const paramParts = this.splitParameters(paramString);

        paramParts.forEach((param, index) => {
            param = param.trim();
            
            const tokens = param.split(/\s+/);
            const name = tokens[tokens.length - 1];
            
            const typeString = param.substring(0, param.lastIndexOf(name)).trim();
            
            const asteriskCount = (typeString.match(/\*/g) || []).length;
            const baseType = typeString.replace(/\*/g, '').trim();
            
            const pointers = '*'.repeat(asteriskCount);
            const fullType = (baseType + (asteriskCount > 0 ? ' ' + pointers : '')).trim();

            params.push({
                name: name,
                type: fullType,
                baseType: baseType,
                isPointer: asteriskCount > 0,
                pointerLevel: asteriskCount
            });
        });

        return params;
    }

    splitParameters(paramString) {
        const params = [];
        let current = '';
        let depth = 0;

        for (let char of paramString) {
            if (char === '(') {
                depth++;
                current += char;
            } else if (char === ')') {
                depth--;
                current += char;
            } else if (char === ',' && depth === 0) {
                params.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        if (current.trim()) {
            params.push(current.trim());
        }

        return params;
    }

    describe(parsed) {
        let description = `Function "${parsed.functionName}" `;
        
        if (parsed.parameterCount === 0) {
            description += 'takes no parameters ';
        } else if (parsed.parameterCount === 1) {
            description += 'takes 1 parameter ';
        } else {
            description += `takes ${parsed.parameterCount} parameters `;
        }

        description += `and returns "${parsed.returnType}".`;

        return description;
    }

    /**
     * Check if return type matches a given type
     * @param {Object} parsed - Parsed prototype
     * @param {string} checkType - Type to check against
     * @returns {boolean}
     */
    matchesReturnType(parsed, checkType) {
        return parsed.returnType.toLowerCase().includes(checkType.toLowerCase());
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FunctionAnalyzer;
}
