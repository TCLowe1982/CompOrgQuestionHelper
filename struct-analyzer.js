class StructAnalyzer {
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
        this.alignment = true;
    }

    setTypeSizes(sizes) {
        this.typeSizes = { ...this.typeSizes, ...sizes };
    }

    getTypeSize(type) {
        type = type.trim();
        
        if (type.includes('*')) {
            return this.typeSizes.pointer;
        }
        
        const arrayMatch = type.match(/(\w+)\s*\[(\d+)\]/);
        if (arrayMatch) {
            const baseType = arrayMatch[1];
            const count = parseInt(arrayMatch[2]);
            return this.getTypeSize(baseType) * count;
        }

        return this.typeSizes[type] || 4;
    }

    getAlignment(type) {
        if (!this.alignment) return 1;
        
        const size = this.getTypeSize(type);
        return Math.min(size, 8);
    }

    calculatePadding(offset, alignment) {
        if (!this.alignment || alignment <= 1) return 0;
        const remainder = offset % alignment;
        return remainder === 0 ? 0 : alignment - remainder;
    }

    parseStruct(structDef) {
        const nameMatch = structDef.match(/struct\s+(\w+)\s*{/);
        const structName = nameMatch ? nameMatch[1] : 'anonymous';

        const membersMatch = structDef.match(/{([^}]+)}/);
        if (!membersMatch) {
            throw new Error('Invalid struct definition');
        }

        const memberLines = membersMatch[1]
            .split(';')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        const members = [];
        let offset = 0;

        memberLines.forEach(line => {
            const match = line.match(/^(.*?)\s+(\w+)(\[(\d+)\])?$/);
            
            if (match) {
                const baseType = match[1].trim();
                const name = match[2];
                const arraySize = match[4] ? parseInt(match[4]) : null;
                
                const fullType = arraySize ? `${baseType}[${arraySize}]` : baseType;
                const typeSize = this.getTypeSize(fullType);
                const alignment = this.getAlignment(baseType);
                
                const padding = this.calculatePadding(offset, alignment);
                offset += padding;

                members.push({
                    name: name,
                    type: fullType,
                    baseType: baseType,
                    isArray: arraySize !== null,
                    arraySize: arraySize,
                    size: typeSize,
                    alignment: alignment,
                    offset: offset,
                    padding: padding
                });

                offset += typeSize;
            }
        });

        const structAlignment = Math.max(...members.map(m => m.alignment));
        const finalPadding = this.calculatePadding(offset, structAlignment);
        const totalSize = offset + finalPadding;

        return {
            name: structName,
            members: members,
            totalSize: totalSize,
            finalPadding: finalPadding,
            alignment: structAlignment
        };
    }

    getMemberAddress(parsedStruct, baseAddress, memberName) {
        const member = parsedStruct.members.find(m => m.name === memberName);
        
        if (!member) {
            throw new Error(`Member "${memberName}" not found in struct`);
        }

        const address = baseAddress + member.offset;

        return {
            member: member,
            baseAddress: baseAddress,
            offset: member.offset,
            address: address,
            addressHex: '0x' + address.toString(16).toUpperCase()
        };
    }

    visualizeLayout(parsedStruct, baseAddress = 0) {
        let visual = `Struct ${parsedStruct.name} Memory Layout:\n`;
        visual += `Total Size: ${parsedStruct.totalSize} bytes\n\n`;
        visual += `Address | Offset | Size | Member\n`;
        visual += `--------|--------|------|-------\n`;

        parsedStruct.members.forEach(member => {
            const addr = baseAddress + member.offset;
            const addrStr = addr.toString().padStart(7);
            const offsetStr = member.offset.toString().padStart(6);
            const sizeStr = member.size.toString().padStart(4);
            
            if (member.padding > 0) {
                visual += `        | ${(member.offset - member.padding).toString().padStart(6)} | ${member.padding.toString().padStart(4)} | [padding]\n`;
            }
            
            visual += `${addrStr} | ${offsetStr} | ${sizeStr} | ${member.name} (${member.type})\n`;
        });

        if (parsedStruct.finalPadding > 0) {
            const addr = baseAddress + parsedStruct.totalSize - parsedStruct.finalPadding;
            visual += `${addr.toString().padStart(7)} | ${(parsedStruct.totalSize - parsedStruct.finalPadding).toString().padStart(6)} | ${parsedStruct.finalPadding.toString().padStart(4)} | [final padding]\n`;
        }

        return visual;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = StructAnalyzer;
}
