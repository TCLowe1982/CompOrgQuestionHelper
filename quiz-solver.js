function switchMainTab(index) {
    const tabs = document.querySelectorAll('.main-tab');
    const panels = document.querySelectorAll('.tab-panel');

    tabs.forEach((tab, i) => {
        tab.classList.toggle('active', i === index);
    });

    panels.forEach((panel, i) => {
        panel.classList.toggle('active', i === index);
    });
}

function analyzeARM() {
    const code = document.getElementById('armInput').value;
    const resultsDiv = document.getElementById('armResults');

    if (!code.trim()) {
        resultsDiv.innerHTML = '<div class="result-box"><p style="color: #dc3545;">Please enter ARM assembly code!</p></div>';
        return;
    }

    try {
        const analyzer = new ARMAnalyzer();
        analyzer.parse(code);

        const testValues = [0, 1, 15, 16, 17, 32];
        const analysis = analyzer.analyze(testValues);

        let html = '<div class="result-box">';
        html += '<h3>📊 Test Results</h3>';
        html += '<table><thead><tr><th>Initial r0</th><th>Final r0</th><th>Change</th></tr></thead><tbody>';

        const changes = analysis.results.map(r => r.change);
        const hasVariation = new Set(changes).size > 1;

        analysis.results.forEach(r => {
            const isUnique = hasVariation && changes.filter(c => c === r.change).length === 1;
            const style = isUnique ? 'background: #fff3cd;' : '';
            html += `<tr style="${style}"><td>${r.initial}</td><td>${r.final}</td><td>${r.change >= 0 ? '+' : ''}${r.change}</td></tr>`;
        });

        html += '</tbody></table></div>';

        html += '<div class="result-box">';
        html += '<h3>✅ Answer: Equivalent C Code</h3>';
        html += `<pre>${analysis.cCode}</pre>`;
        html += '</div>';

        resultsDiv.innerHTML = html;
    } catch (error) {
        resultsDiv.innerHTML = `<div class="result-box"><p style="color: #dc3545;">Error: ${error.message}</p></div>`;
    }
}

function analyzeMemory() {
    const statement = document.getElementById('memInput').value;
    const resultsDiv = document.getElementById('memResults');

    if (!statement.trim()) {
        resultsDiv.innerHTML = '<div class="result-box"><p style="color: #dc3545;">Please enter a malloc statement!</p></div>';
        return;
    }

    try {
        const calculator = new MemoryCalculator();
        
        calculator.setTypeSizes({
            'int': parseInt(document.getElementById('memIntSize').value),
            'pointer': parseInt(document.getElementById('memPtrSize').value),
            'char': parseInt(document.getElementById('memCharSize').value),
            'double': parseInt(document.getElementById('memDoubleSize').value)
        });

        const analysis = calculator.analyzeMalloc(statement);

        let html = '<div class="result-box">';
        html += '<h3>✅ Answer</h3>';
        html += `<div class="answer-highlight">${analysis.bytes} bytes</div>`;
        html += '</div>';

        html += '<div class="result-box">';
        html += '<h3>📊 Calculation Breakdown</h3>';
        html += `<p><strong>Statement:</strong> <code>${analysis.statement}</code></p>`;
        html += `<p><strong>malloc() expression:</strong> <code>${analysis.expression}</code></p>`;
        
        if (analysis.replacements.length > 0) {
            html += '<table><thead><tr><th>Expression</th><th>Type</th><th>Size (bytes)</th></tr></thead><tbody>';
            analysis.replacements.forEach(r => {
                html += `<tr><td><code>${r.original}</code></td><td>${r.type}</td><td>${r.size}</td></tr>`;
            });
            html += '</tbody></table>';
        }

        html += `<p><strong>Evaluated:</strong> <code>${analysis.parsedExpression}</code> = <strong>${analysis.bytes} bytes</strong></p>`;
        html += `<p><strong>Formatted:</strong> ${calculator.formatBytes(analysis.bytes)}</p>`;
        html += '</div>';

        if (analysis.varName) {
            html += '<div class="result-box">';
            html += '<h3>📝 Variable Information</h3>';
            html += `<p><strong>Variable Name:</strong> ${analysis.varName}</p>`;
            html += `<p><strong>Variable Type:</strong> ${analysis.varType}</p>`;
            html += '</div>';
        }

        resultsDiv.innerHTML = html;
    } catch (error) {
        resultsDiv.innerHTML = `<div class="result-box"><p style="color: #dc3545;">Error: ${error.message}</p></div>`;
    }
}

function analyzeFunction() {
    const prototype = document.getElementById('funcInput').value;
    const resultsDiv = document.getElementById('funcResults');

    if (!prototype.trim()) {
        resultsDiv.innerHTML = '<div class="result-box"><p style="color: #dc3545;">Please enter a function prototype!</p></div>';
        return;
    }

    try {
        const analyzer = new FunctionAnalyzer();
        const parsed = analyzer.parsePrototype(prototype);

        let html = '<div class="result-box">';
        html += '<h3>✅ Answer: Return Type</h3>';
        html += `<div class="answer-highlight">${parsed.returnType}</div>`;
        html += '</div>';

        html += '<div class="result-box">';
        html += '<h3>📊 Function Analysis</h3>';
        html += `<p><strong>Function Name:</strong> ${parsed.functionName}</p>`;
        html += `<p><strong>Return Type:</strong> ${parsed.returnType}</p>`;
        
        if (parsed.isPointer) {
            html += `<p><strong>Returns Pointer:</strong> Yes (${parsed.pointerLevel} level${parsed.pointerLevel > 1 ? 's' : ''})</p>`;
        }

        if (parsed.storageClass) {
            html += `<p><strong>Storage Class:</strong> ${parsed.storageClass}</p>`;
        }

        if (parsed.qualifiers.length > 0) {
            html += `<p><strong>Qualifiers:</strong> ${parsed.qualifiers.join(', ')}</p>`;
        }

        html += `<p><strong>Parameter Count:</strong> ${parsed.parameterCount}</p>`;
        html += `<p><em>${analyzer.describe(parsed)}</em></p>`;
        html += '</div>';

        if (parsed.parameters.length > 0) {
            html += '<div class="result-box">';
            html += '<h3>📝 Parameters</h3>';
            html += '<table><thead><tr><th>#</th><th>Name</th><th>Type</th><th>Is Pointer?</th></tr></thead><tbody>';
            
            parsed.parameters.forEach((param, i) => {
                html += `<tr>
                    <td>${i + 1}</td>
                    <td>${param.name}</td>
                    <td>${param.type}</td>
                    <td>${param.isPointer ? '✓ Yes' : '✗ No'}</td>
                </tr>`;
            });
            
            html += '</tbody></table></div>';
        }

        resultsDiv.innerHTML = html;
    } catch (error) {
        resultsDiv.innerHTML = `<div class="result-box"><p style="color: #dc3545;">Error: ${error.message}</p></div>`;
    }
}

function analyzeStruct() {
    const structDef = document.getElementById('structInput').value;
    const resultsDiv = document.getElementById('structResults');

    if (!structDef.trim()) {
        resultsDiv.innerHTML = '<div class="result-box"><p style="color: #dc3545;">Please enter a struct definition!</p></div>';
        return;
    }

    try {
        const analyzer = new StructAnalyzer();
        
        analyzer.setTypeSizes({
            'int': parseInt(document.getElementById('structIntSize').value)
        });
        analyzer.alignment = document.getElementById('structAlignment').value === 'true';

        const parsed = analyzer.parseStruct(structDef);
        const baseAddress = parseInt(document.getElementById('structBaseAddr').value);
        const memberName = document.getElementById('structMember').value.trim();

        let html = '';

        if (memberName) {
            try {
                const memberInfo = analyzer.getMemberAddress(parsed, baseAddress, memberName);
                
                html += '<div class="result-box">';
                html += '<h3>✅ Answer: Member Address</h3>';
                html += `<div class="answer-highlight">${memberInfo.address} (decimal)</div>`;
                html += `<p style="text-align: center; margin-top: 10px;"><strong>Hex:</strong> ${memberInfo.addressHex}</p>`;
                html += '</div>';

                html += '<div class="result-box">';
                html += '<h3>📊 Address Calculation</h3>';
                html += `<p><strong>Base Address:</strong> ${baseAddress}</p>`;
                html += `<p><strong>Member:</strong> ${memberName}</p>`;
                html += `<p><strong>Offset:</strong> +${memberInfo.offset} bytes</p>`;
                html += `<p><strong>Member Size:</strong> ${memberInfo.member.size} bytes</p>`;
                html += `<p><strong>Member Type:</strong> ${memberInfo.member.type}</p>`;
                if (memberInfo.member.padding > 0) {
                    html += `<p><strong>Padding Before:</strong> ${memberInfo.member.padding} bytes</p>`;
                }
                html += `<p><strong>Final Address:</strong> ${baseAddress} + ${memberInfo.offset} = <strong>${memberInfo.address}</strong></p>`;
                html += '</div>';
            } catch (error) {
                html += `<div class="result-box"><p style="color: #dc3545;">Error finding member: ${error.message}</p></div>`;
            }
        }

        html += '<div class="result-box">';
        html += '<h3>🏗️ Complete Memory Layout</h3>';
        html += `<p><strong>Struct Name:</strong> ${parsed.name}</p>`;
        html += `<p><strong>Total Size:</strong> ${parsed.totalSize} bytes</p>`;
        html += `<p><strong>Alignment:</strong> ${parsed.alignment} bytes</p>`;
        html += '<div class="memory-layout">' + analyzer.visualizeLayout(parsed, baseAddress) + '</div>';
        html += '</div>';

        html += '<div class="result-box">';
        html += '<h3>📋 Members Details</h3>';
        html += '<table><thead><tr><th>Member</th><th>Type</th><th>Offset</th><th>Size</th><th>Address</th></tr></thead><tbody>';
        
        parsed.members.forEach(member => {
            const addr = baseAddress + member.offset;
            const highlight = member.name === memberName ? 'background: #fff3cd;' : '';
            html += `<tr style="${highlight}">
                <td>${member.name}</td>
                <td>${member.type}</td>
                <td>${member.offset}</td>
                <td>${member.size}</td>
                <td>${addr} (0x${addr.toString(16).toUpperCase()})</td>
            </tr>`;
        });
        
        html += '</tbody></table></div>';

        resultsDiv.innerHTML = html;
    } catch (error) {
        resultsDiv.innerHTML = `<div class="result-box"><p style="color: #dc3545;">Error: ${error.message}</p></div>`;
    }
}

window.onload = () => {
};
