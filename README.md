# C Programming Quiz Solver 🎓

A comprehensive JavaScript tool suite to help solve common C programming quiz questions instantly. Includes ARM assembly analysis, memory allocation calculations, function prototype parsing, and struct memory layout visualization.

## Hosting
The solvers are available at: [Solvers](https://tclowe1982.github.io/CompOrgQuestionHelper/index.html)

## Features

### 🔧 ARM Assembly to C Analyzer
- **Parse ARM assembly code** - Supports CMP, BEQ, BNE, BGT, BLT, ADD, SUB, MOV, B
- **Simulate execution** - Test with different register values
- **Generate C code** - Automatically generate equivalent C code
- **Execution tracing** - See step-by-step execution with register values

### 💾 Memory Allocation Calculator
- **Calculate malloc bytes** - Parse and evaluate malloc expressions
- **sizeof() evaluation** - Handles sizeof(type) for any data type
- **Custom type sizes** - Configure int, pointer, char, double sizes
- **Expression breakdown** - Shows step-by-step calculation

### 📝 Function Prototype Analyzer
- **Parse function signatures** - Extract return types and parameters
- **Pointer detection** - Identify pointer return types and levels
- **Parameter analysis** - Full breakdown of all parameters
- **Storage classes** - Detect static, extern, etc.

### 🏗️ Struct Memory Layout Analyzer
- **Calculate member offsets** - Find exact memory addresses
- **Alignment support** - Realistic or simple memory layout
- **Visual layout** - ASCII art memory map
- **Member addressing** - Calculate address of specific members

## Quick Start

### 🚀 Interactive Web Interface (Recommended)

Simply open **`quiz-solver.html`** in your browser - no installation required!

```bash
# Just double-click quiz-solver.html
# Or open it from command line:
start quiz-solver.html
```

This gives you access to all four question types in a beautiful tabbed interface.

### 📦 Individual Tools

Each tool can also be used separately:
- **`index.html`** - ARM Assembly analyzer only
- **`arm-analyzer.js`** - ARM Assembly module
- **`memory-calculator.js`** - Memory allocation module
- **`function-analyzer.js`** - Function prototype module
- **`struct-analyzer.js`** - Struct layout module

### 📚 Use as JavaScript Library

```javascript
// ARM Assembly
const armAnalyzer = new ARMAnalyzer();
armAnalyzer.parse('cmp r0, #5\nbeq label\nadd r0, #1');
const result = armAnalyzer.simulate(5);

// Memory Allocation
const memCalc = new MemoryCalculator();
memCalc.setTypeSizes({ 'int': 4 });
const bytes = memCalc.analyzeMalloc('malloc(10*sizeof(int))');

// Function Prototype
const funcAnalyzer = new FunctionAnalyzer();
const parsed = funcAnalyzer.parsePrototype('int foo(char a, double * b)');
console.log(parsed.returnType); // "int"

// Struct Layout
const structAnalyzer = new StructAnalyzer();
const struct = structAnalyzer.parseStruct('struct bar { int v0; int v1; }');
const address = structAnalyzer.getMemberAddress(struct, 10, 'v1');
```

## Example Questions & Answers

### 1️⃣ ARM Assembly Question
**Question:** Given the following ARM assembly, what is the equivalent C code?
```assembly
cmp r0, #0x10
beq foo
add r0, #1
foo:
    add r0, #2
```

**Answer:**
```c
if (r0 == 0x10) {
    r0 = r0 + 2;
} else {
    r0 = r0 + 3;
}
```

### 2️⃣ Memory Allocation Question
**Question:** How many bytes of memory is allocated by the following line if sizeof(int) is 2 bytes?
```c
int * intarray = malloc(5*sizeof(int));
```

**Answer:** **10 bytes**
- Calculation: 5 * sizeof(int) = 5 * 2 = 10 bytes

### 3️⃣ Function Prototype Question
**Question:** What type is returned from this function?
```c
int foo(char a, double * b);
```

**Answer:** **int**
- Function returns type `int`
- Takes 2 parameters: char and double pointer

### 4️⃣ Struct Memory Layout Question
**Question:** Given the following struct where sizeof(int) is 2 bytes, if mystruct is at address 10 (decimal), what is the address of mystruct.v1?
```c
struct bar {
    int v0;
    int v1;
    int v2;
};
```

**Answer:** **12** (decimal)
- Base address: 10
- v0 offset: 0 (address 10)
- v1 offset: 2 (address 12)
- v2 offset: 4 (address 14)

## Files

### 🌟 Main Application
- **`quiz-solver.html`** - Complete unified interface with all 4 question types
- **`quiz-solver.js`** - UI controller and integration logic

### 🔧 Individual Modules
- **`arm-analyzer.js`** - ARM Assembly to C analyzer
- **`memory-calculator.js`** - Memory allocation calculator
- **`function-analyzer.js`** - Function prototype parser
- **`struct-analyzer.js`** - Struct memory layout analyzer

### 📄 Legacy/Standalone
- **`index.html`** - ARM Assembly analyzer standalone interface
- **`embed-example.html`** - Minimal embedding example
- **`arm_analyzer.py`** - Python version (legacy)

## Supported Instructions & Types

- `CMP` - Compare register with value
- `BEQ` - Branch if equal
- `BNE` - Branch if not equal
- `BGT` - Branch if greater than
- `BLT` - Branch if less than
- `B`/`BAL` - Unconditional branch
- `ADD` - Addition
- `SUB` - Subtraction
- `MOV` - Move value to register

## Example Output

For the given assembly code:

```assembly
cmp r0, #0x10
beq foo
add r0, #1
foo:
    add r0, #2
```

The tool will show:

**Simulation Results:**
```
r0:   0 ->   3  (change: +3)
r0:  15 ->  18  (change: +3)
r0:  16 ->  18  (change: +2)  <- Different behavior!
r0:  17 ->  20  (change: +3)
```

**Equivalent C Code:**
```c
if (r0 == 16) {
    r0 = r0 + 1;
} else {
    r0 = r0 + 2;
}
```

Or more intuitively:
```c
if (r0 == 0x10) {
    r0 = r0 + 2;
} else {
    r0 = r0 + 3;
}

// OR equivalently:

if (r0 != 0x10) {
    r0 = r0 + 1;
}
r0 = r0 + 2;
```

## API Reference

### ARMAnalyzer Class

#### `parse(assemblyCode)`
Parse ARM assembly code into instructions.

```javascript
analyzer.parse('cmp r0, #5\nbeq foo\nadd r0, #1\nfoo:\nadd r0, #2');
```

#### `simulate(initialR0, maxSteps = 100)`
Simulate execution with given initial r0 value.

```javascript
const { finalR0, trace } = analyzer.simulate(16);
```

Returns:
- `finalR0` - Final value of r0
- `trace` - Array of execution trace lines

#### `generateCCode(testValues = null)`
Generate equivalent C code.

```javascript
const cCode = analyzer.generateCCode([0, 16, 32]);
```

#### `analyze(testValues = [...])`
Perform full analysis with multiple test values.

```javascript
const analysis = analyzer.analyze([0, 15, 16, 17]);
// Returns: { results, cCode, instructions, labels }
```

## How It Works

1. **Parsing** - Converts assembly text into instruction objects with labels
2. **Simulation** - Executes instructions step-by-step, tracking register values and branches
3. **Analysis** - Compares results across different inputs to identify patterns
4. **Code Generation** - Constructs equivalent C code based on control flow

## Tips for Solving Questions

### ARM Assembly
1. **Test boundary values** - Test values around comparison points
2. **Look for patterns** - Check if results vary (highlighted in UI)
3. **Trace execution** - Follow step-by-step execution
4. **Compare paths** - See which instructions execute in different scenarios

### Memory Allocation
1. **Verify type sizes** - Check the sizeof values for your system
2. **Break down expressions** - Evaluate sizeof() first, then arithmetic
3. **Watch for pointers** - Pointer size may differ from data type size

### Function Prototypes
1. **Count pointer stars** - Return type can have multiple levels
2. **Check full signature** - Don't miss const, static, or other qualifiers
3. **Parameter order** - Parameters are parsed left to right

### Struct Layout
1. **Enable alignment** - Use realistic mode for actual compiler behavior
2. **Check padding** - Alignment can add hidden padding bytes
3. **Base + Offset** - Address = base address + member offset

## Browser Compatibility

Works in all modern browsers:
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

**No external dependencies** - pure vanilla JavaScript!
**No server required** - runs entirely in your browser!

## Limitations & Known Issues

### ARM Assembly
- Single register (r0) support only
- Simple control flow (no nested loops)
- Immediate values must be in format `#value` or `#0xvalue`

### Memory Allocation
- Evaluates expressions using JavaScript eval (safe for math only)
- Doesn't handle complex sizeof expressions like sizeof(struct)

### Function Prototypes
- May not handle all edge cases of complex C syntax
- Function pointers not fully supported

### Struct Layout  
- Simplified alignment model (may not match all compilers exactly)
- No support for bitfields or unions
- Padding calculation assumes standard C alignment rules

## Future Enhancements

### Planned Features
- ✨ Multiple ARM registers (r1-r15)
- ✨ More ARM instructions (LSL, LSR, MUL, ORR, AND, LDR, STR)
- ✨ Nested struct support
- ✨ Union memory layout
- ✨ Bitfield calculations

## Disclaimer
This project was created with the help of ClaudeCode, and with GitHub Copilot. This code does not contain any external calls, but if any machine generated code violates your schools academic intergetigy policy, you have been so warned. The Planned features are cool things that I would like to figure out how to do, but were not needed for my upcomming exam, so I chose not to focus on them. If you like this code, hate this code, have ideas how to improve this code, feel free to do so. I guarantee no support of anything regarding this repository past the test date, and then only about 50/50. This was a student project, designed to help check their answers without having to boot up an entire emulator. This may very well produce inccorect results, because my test cases were very limited. Sorry in advance. And this last bit should go without saying, but use at your own risk. I don't expect it to do anything stupid, but I've managed to create some rather spectacular failures before. Other than that, good luck, have fun.

