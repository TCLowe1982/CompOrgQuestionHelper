class MemoryCalculator {
    constructor() {
        this.typeSizes = {
            'char': 1,
            'short': 2,
            'int': 2,
            'long': 4,
            'long long': 8,
            'float': 4,
            'double': 8,
            'pointer': 4
        };
    }

    setTypeSizes(sizes) {
        this.typeSizes = { ...this.typeSizes, ...sizes };
    }

    evaluateMalloc(expression) {
        expression = expression.trim();

        if (!expression) {
            throw new Error('Empty expression');
        }

        const sizeofRegex = /sizeof\s*\(\s*(\w+(?:\s*\*)?)\s*\)/g;
        let parsedExpression = expression;
        const replacements = [];

        let match;
        while ((match = sizeofRegex.exec(expression)) !== null) {
            const type = match[1].trim();
            const isPointer = type.includes('*');
            const baseType = type.replace('*', '').trim();
            
            const size = isPointer ? this.typeSizes.pointer : (this.typeSizes[baseType] || 0);
            
            if (size === 0) {
                throw new Error(`Unknown type: ${baseType}`);
            }
            
            replacements.push({
                original: match[0],
                type: type,
                size: size
            });
            
            parsedExpression = parsedExpression.replace(match[0], size.toString());
        }

        if (!/^[\d\s+\-*/().]+$/.test(parsedExpression)) {
            throw new Error('Expression contains invalid characters: ' + parsedExpression);
        }

        try {
            const result = eval(parsedExpression);
            
            if (!Number.isFinite(result)) {
                throw new Error('Expression does not evaluate to a valid number');
            }
            
            return {
                bytes: result,
                expression: expression,
                parsedExpression: parsedExpression,
                replacements: replacements
            };
        } catch (error) {
            throw new Error('Invalid expression: ' + error.message);
        }
    }

    analyzeMalloc(statement) {
        const mallocIndex = statement.indexOf('malloc');
        if (mallocIndex === -1) {
            throw new Error('No malloc() found in statement');
        }

        let openParenIndex = statement.indexOf('(', mallocIndex);
        if (openParenIndex === -1) {
            throw new Error('No opening parenthesis found after malloc');
        }

        let parenCount = 1;
        let closeParenIndex = openParenIndex + 1;
        
        while (closeParenIndex < statement.length && parenCount > 0) {
            if (statement[closeParenIndex] === '(') {
                parenCount++;
            } else if (statement[closeParenIndex] === ')') {
                parenCount--;
            }
            if (parenCount > 0) {
                closeParenIndex++;
            }
        }

        if (parenCount !== 0) {
            throw new Error('Unmatched parentheses in malloc() call');
        }

        const expression = statement.substring(openParenIndex + 1, closeParenIndex);
        const result = this.evaluateMalloc(expression);

        const varMatch = statement.match(/(\w+(?:\s*\*)?\s+\*?\s*)(\w+)\s*=/);
        let varType = null;
        let varName = null;
        
        if (varMatch) {
            varType = varMatch[1].trim();
            varName = varMatch[2];
        }

        return {
            ...result,
            varType: varType,
            varName: varName,
            statement: statement
        };
    }

    formatBytes(bytes) {
        if (bytes < 1024) return `${bytes} bytes`;
        if (bytes < 1024 * 1024) return `${bytes} bytes (${(bytes / 1024).toFixed(2)} KB)`;
        return `${bytes} bytes (${(bytes / 1024 / 1024).toFixed(2)} MB)`;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MemoryCalculator;
}
