class ARMAnalyzer {
    constructor() {
        this.instructions = [];
        this.labels = {};
    }

    parse(assemblyCode) {
        this.instructions = [];
        this.labels = {};

        const lines = assemblyCode.trim().split('\n');

        lines.forEach((line, lineNum) => {
            line = line.replace(/;.*$/, '').trim();
            if (!line) return;

            let label = null;
            if (line.includes(':')) {
                const parts = line.split(':', 2);
                label = parts[0].trim();
                line = parts.length > 1 ? parts[1].trim() : '';
            }

            if (!line) {
                if (label) {
                    this.labels[label] = this.instructions.length;
                }
                return;
            }

            const spaceIndex = line.indexOf(' ');
            let opcode, operands = [];

            if (spaceIndex === -1) {
                opcode = line.toLowerCase();
            } else {
                opcode = line.substring(0, spaceIndex).toLowerCase();
                const operandStr = line.substring(spaceIndex + 1).trim();
                operands = operandStr.split(',').map(op => op.trim());
            }

            console.log(`Parsing line: "${line}" → opcode="${opcode}", operands=[${operands.join(', ')}]`);

            const instr = {
                label: label,
                opcode: opcode,
                operands: operands,
                lineNum: lineNum,
                raw: line
            };

            if (label) {
                this.labels[label] = this.instructions.length;
            }

            this.instructions.push(instr);
        });
    }

    _parseValue(operand, registers) {
        operand = operand.trim();

        if (operand.startsWith('#')) {
            const valueStr = operand.substring(1);
            if (valueStr.startsWith('0x')) {
                const result = parseInt(valueStr, 16);
                console.log(`Parsing ${operand}: valueStr="${valueStr}" → ${result}`);
                return result;
            } else {
                const result = parseInt(valueStr, 10);
                console.log(`Parsing ${operand}: valueStr="${valueStr}" → ${result}`);
                return result;
            }
        } else if (operand in registers) {
            return registers[operand];
        } else {
            return 0;
        }
    }

    // Instruction handlers map - much cleaner than else-if chain
    _getInstructionHandlers() {
        return {
            'cmp': (instr, registers, pc, trace) => {
                const reg = instr.operands[0];
                const value = this._parseValue(instr.operands[1], registers);
                registers._cmp_result = registers[reg] - value;
                registers._cmp_eq = (registers[reg] === value);
                registers._cmp_gt = (registers[reg] > value);
                registers._cmp_lt = (registers[reg] < value);
                return pc + 1;
            },

            'beq': (instr, registers, pc, trace) => {
                if (registers._cmp_eq) {
                    const target = instr.operands[0];
                    trace.push(`    -> Branching to ${target}`);
                    return this.labels[target];
                } else {
                    trace.push(`    -> Not branching`);
                    return pc + 1;
                }
            },

            'bne': (instr, registers, pc, trace) => {
                if (!registers._cmp_eq) {
                    const target = instr.operands[0];
                    trace.push(`    -> Branching to ${target}`);
                    return this.labels[target];
                } else {
                    trace.push(`    -> Not branching`);
                    return pc + 1;
                }
            },

            'bgt': (instr, registers, pc, trace) => {
                if (registers._cmp_gt) {
                    const target = instr.operands[0];
                    trace.push(`    -> Branching to ${target}`);
                    return this.labels[target];
                } else {
                    trace.push(`    -> Not branching`);
                    return pc + 1;
                }
            },

            'blt': (instr, registers, pc, trace) => {
                if (registers._cmp_lt) {
                    const target = instr.operands[0];
                    trace.push(`    -> Branching to ${target}`);
                    return this.labels[target];
                } else {
                    trace.push(`    -> Not branching`);
                    return pc + 1;
                }
            },

            'add': (instr, registers, pc, trace) => {
                const dest = instr.operands[0];
                if (instr.operands.length === 2) {
                    const value = this._parseValue(instr.operands[1], registers);
                    registers[dest] = (registers[dest] || 0) + value;
                } else {
                    const src = instr.operands[1];
                    const value = this._parseValue(instr.operands[2], registers);
                    registers[dest] = registers[src] + value;
                }
                trace.push(`    -> r0 = ${registers.r0}`);
                return pc + 1;
            },

            'sub': (instr, registers, pc, trace) => {
                const dest = instr.operands[0];
                if (instr.operands.length === 2) {
                    const value = this._parseValue(instr.operands[1], registers);
                    registers[dest] = (registers[dest] || 0) - value;
                } else {
                    const src = instr.operands[1];
                    const value = this._parseValue(instr.operands[2], registers);
                    registers[dest] = registers[src] - value;
                }
                trace.push(`    -> r0 = ${registers.r0}`);
                return pc + 1;
            },

            'mov': (instr, registers, pc, trace) => {
                const dest = instr.operands[0];
                const value = this._parseValue(instr.operands[1], registers);
                registers[dest] = value;
                trace.push(`    -> r0 = ${registers.r0}`);
                return pc + 1;
            },

            'b': (instr, registers, pc, trace) => {
                const target = instr.operands[0];
                trace.push(`    -> Branching to ${target}`);
                return this.labels[target];
            },

            'bal': (instr, registers, pc, trace) => {
                const target = instr.operands[0];
                trace.push(`    -> Branching to ${target}`);
                return this.labels[target];
            }
        };
    }

    simulate(initialR0, maxSteps = 100) {
        const registers = { r0: initialR0 };
        let pc = 0;
        const trace = [];
        let steps = 0;
        const handlers = this._getInstructionHandlers();

        while (pc < this.instructions.length && steps < maxSteps) {
            const instr = this.instructions[pc];
            steps++;

            if (instr.label) {
                trace.push(`Label ${instr.label}:`);
            }

            trace.push(`  ${instr.raw} (r0=${registers.r0})`);

            // Look up and execute instruction handler
            const handler = handlers[instr.opcode];
            if (handler) {
                pc = handler(instr, registers, pc, trace);
            } else {
                trace.push(`    -> Unknown instruction: ${instr.opcode}`);
                pc++;
            }
        }

        return {
            finalR0: registers.r0,
            trace: trace
        };
    }

    _instrToC(instr) {
        if (instr.opcode === 'add') {
            if (instr.operands.length === 2) {
                const value = instr.operands[1].replace('#', '');
                return `r0 = r0 + ${value};`;
            } else {
                const value = instr.operands[2].replace('#', '');
                return `${instr.operands[0]} = ${instr.operands[1]} + ${value};`;
            }
        } else if (instr.opcode === 'sub') {
            if (instr.operands.length === 2) {
                const value = instr.operands[1].replace('#', '');
                return `r0 = r0 - ${value};`;
            } else {
                const value = instr.operands[2].replace('#', '');
                return `${instr.operands[0]} = ${instr.operands[1]} - ${value};`;
            }
        } else if (instr.opcode === 'mov') {
            const value = instr.operands[1].replace('#', '');
            return `${instr.operands[0]} = ${value};`;
        }
        return `// ${instr.raw}`;
    }

    generateCCode(testValues = null) {
        if (!testValues) {
            testValues = [0, 1, 15, 16, 17, 100];
        }

        const results = {};
        testValues.forEach(val => {
            const { finalR0 } = this.simulate(val);
            results[val] = finalR0;
        });

        let cCode = '// Equivalent C code\n\n';

        const hasConditional = this.instructions.some(instr =>
            ['beq', 'bne', 'bgt', 'blt'].includes(instr.opcode)
        );

        if (hasConditional) {
            for (let i = 0; i < this.instructions.length; i++) {
                const instr = this.instructions[i];

                if (instr.opcode === 'cmp') {
                    const cmpValue = this._parseValue(instr.operands[1], {});

                    if (i + 1 < this.instructions.length) {
                        const branch = this.instructions[i + 1];

                        if (branch.opcode === 'beq') {
                            cCode += `if (r0 != ${cmpValue}) {\n`;
                        } else if (branch.opcode === 'bne') {
                            cCode += `if (r0 == ${cmpValue}) {\n`;
                        } else if (branch.opcode === 'bgt') {
                            cCode += `if (r0 <= ${cmpValue}) {\n`;
                        } else if (branch.opcode === 'blt') {
                            cCode += `if (r0 >= ${cmpValue}) {\n`;
                        }

                        const targetLabel = branch.operands[0];
                        const targetIdx = this.labels[targetLabel];

                        const truePath = [];
                        for (let j = targetIdx; j < this.instructions.length; j++) {
                            const inst = this.instructions[j];
                            if (['add', 'sub', 'mov'].includes(inst.opcode)) {
                                truePath.push(inst);
                            } else if (inst.opcode.startsWith('b')) {
                                break;
                            }
                        }

                        const falsePath = [];
                        for (let j = i + 2; j < targetIdx; j++) {
                            const inst = this.instructions[j];
                            if (['add', 'sub', 'mov'].includes(inst.opcode)) {
                                falsePath.push(inst);
                            }
                        }

                        if (falsePath.length > 0) {
                            falsePath.forEach(inst => {
                                cCode += `    ${this._instrToC(inst)}\n`;
                            });
                            cCode += '}\n';
                            if (truePath.length > 0) {
                                truePath.forEach(inst => {
                                    cCode += `${this._instrToC(inst)}\n`;
                                });
                            }
                        } else {
                            truePath.forEach(inst => {
                                cCode += `    ${this._instrToC(inst)}\n`;
                            });
                            cCode += '}\n';
                        }

                        break;
                    }
                }
            }
        } else {
            this.instructions.forEach(instr => {
                if (['add', 'sub', 'mov'].includes(instr.opcode)) {
                    cCode += `${this._instrToC(instr)}\n`;
                }
            });
        }

        return cCode;
    }

    analyze(testValues = [0, 1, 15, 16, 17, 32, 100]) {
        const results = [];

        testValues.forEach(val => {
            const { finalR0, trace } = this.simulate(val);
            results.push({
                initial: val,
                final: finalR0,
                change: finalR0 - val,
                trace: trace
            });
        });

        return {
            results: results,
            cCode: this.generateCCode(testValues),
            instructions: this.instructions,
            labels: this.labels
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ARMAnalyzer;
}
