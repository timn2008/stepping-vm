//---------------------------------------------------------------------------------------------

const tableBody = document.getElementById('table-body');
const addRowButton = document.getElementById('add-row');
const resetTableButton = document.getElementById('reset-table');
const nextStepButton = document.getElementById('next-step');
let currentRowNumber = 1;

//---------------------------------------------------------------------------------------------
function make_description(args) {
    function op2txt(op, a='о') {
        if (op.trim().length==0) 
            return "...";
        if (op[0] != "#") {
            return `числ${a} ${op}`;
        } else {
            return `числ${a}, яке записане на рядку ${op},`;
        }
    }
    var op1 = op2txt(args[0] || '');
    var op1a = op2txt(args[0] || '', 'а');
    var op2 = op2txt(args[2] || '');
    var op2u = op2txt(args[2] || '', 'у');
    var dest = args[3] || '';
    var nxt = args[4] || '';
    var cmd = args[1] || '';
    var s = `; <br>перейти на крок ${nxt || "<завершити>"}`;
    switch (cmd) {
        case '+': s = `Додати ${op1} та ${op2} і записати результат на рядок ${dest}` + s;  break;
        case '-': s = `Відняти від ${op1a} ${op2} і записати результат на рядок ${dest}` + s;  break;
        case '*': s = `Помножити ${op1} та ${op2} і записати результат на рядок ${dest}` + s;  break;
        case '/': s = `Розділити ${op1} на ${op2} і записати результат на рядок ${dest}` + s;  break;
        default:
            if (cmd.trim().length==0) {
                s = "(необхідно ввести операцію)";

            } else {
                const parts = nxt.replace(/\s+/g, '').split('/');
                const branch1 = parseInt(parts[0], 10); // Use base 10 for parsing
                const branch2 = parseInt(parts[1], 10); // Use base 10 for parsing            
                var cmd_txt = "";
                if (cmd == '>') {
                    cmd_txt = "більше за " + op2;
                } else 
                if (cmd == '<') {
                    cmd_txt = "менше за " + op2;
                } else 
                if ((cmd == '=')||(cmd == '==')) {
                    cmd_txt = "рівне " + op2u;
                }            
                s = `Перевірити, чи ${op1} ${cmd_txt} `;
                if (dest.trim().length > 0) {
                    s += `і записати результат на рядок ${dest}`;
                }
                s += `;<br>перейти на крок ${branch1 || "<завершити>"} якщо так, а в іншому разі - перейти на крок ${branch2 || "<завершити>"}`;
            }
            break;
    }

    return s;
    //return `<small>${s}</small>`;
}

// Function to add a new row to the table
function addTableRow(currentRowNumber, args = ['', '', '', '', '']) {
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td contenteditable="true" class="tbl_col0">${currentRowNumber}</td>
        <td contenteditable="true" class="tbl_col1">${args[0]}</td>
        <td contenteditable="true" class="tbl_col2">${args[1]}</td>
        <td contenteditable="true" class="tbl_col3">${args[2]}</td>
        <td contenteditable="true" class="tbl_col4">${args[3]}</td>
        <td contenteditable="true" class="tbl_col5">${args[4]}</td>
        <td contenteditable="true" class="actions narrowfont">${make_description(args)}</td>
        
        <td class="actions narrowfont">
            <button class="move-up">&uarr;</button>
            <button class="move-down">&darr;</button>
            <button class="delete-row">&#10005;</button>
        </td>
    `;
    tableBody.appendChild(newRow);
}

// Function to reset the table and highlight the first row
function resetTable() {
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
        row.classList.remove('highlighted');
    });
    if (rows.length > 0) {
        rows[0].classList.add('highlighted');
    }
}
//--------------------------------------------------------------------------
function tableToPlainText() {
    const table = document.querySelector('table');
    const rows = table.querySelectorAll('tr');
    const separator = '\t'; // You can change the separator as needed

    const plainTextRows = Array.from(rows).map(row => {
        const cells = row.querySelectorAll('td:not(.actions)'); // Exclude the last cell with buttons
        const cellContents = Array.from(cells).map(cell => cell.textContent).join(separator);
        return cellContents;
    });

    return plainTextRows.join('\n');
}


function restoreTableFromPlainText(plainText) {
    const table = document.querySelector('table');
    const rows = plainText.split('\n');
    
    const tbody = table.querySelector('tbody');        
    tbody.innerHTML = '';  // Clear existing table body rows

    rows.forEach(rowText => {
        const rowData = rowText.split('\t');
        addTableRow(rowData[0], rowData.slice(1));
        //tab: "	"
    });
}

//--------------------------------------------------------------------------
// Function to retrieve the contents of a blackboard row by its number
function getBlackboardRow(rowNumber) {
    if (! rowNumber.startsWith('#')) {
        if (rowNumber.indexOf(".") == -1)
            return parseInt(rowNumber, 10);
        else
            return parseFloat(rowNumber);
    }
    // else:
    rowNumber = parseInt(rowNumber.substring(1), 10);
    const blackboard = document.getElementById('blackboard');
    const rows = blackboard.children;

    // Create rows if they don't exist up to the requested rowNumber
    while (rows.length < rowNumber) {
        const newRow = document.createElement('div');
        newRow.classList.add('blackboard-row-style');
        //newRow.style.cssText="border-bottom: 1px solid lightgrey;";
        newRow.textContent = `#${rows.length + 1}: `;
        blackboard.appendChild(newRow);
    }

    // Return the content of the requested row
    const requestedRow = rows[rowNumber - 1];
    //return requestedRow.textContent.slice(`#${rowNumber}: `.length);
    const content = requestedRow.textContent.slice(`#${rowNumber}: `.length);
    if (content.trim().length == 0) {
        alert("Error: location #" + rowNumber + " has not been initialized yet! Will return 0")
        return 0;
    } else {
        if (content.indexOf(".") == -1)
            return parseInt(content, 10);
        else
            return parseFloat(content);
        //return parseInt(content, 10) || 0; // TODO: report error if location was not used
    }
}

// Function to update the contents of a blackboard row by its number
function updateBlackboardRow(rowNumber, data) {
    if (! rowNumber.startsWith('#')) {
        alert('Wrong dest row number format!');
        return;
    }
    rowNumber = parseInt(rowNumber.substring(1), 10);
    const blackboard = document.getElementById('blackboard');
    const rows = blackboard.children;

    // Create rows if they don't exist up to the requested rowNumber
    while (rows.length < rowNumber) {
        const newRow = document.createElement('div');
        newRow.classList.add('blackboard-row-style');
        newRow.textContent = `#${rows.length + 1}: `;
        blackboard.appendChild(newRow);
    }

    // Update the content of the requested row
    const requestedRow = rows[rowNumber - 1];
    requestedRow.textContent = `#${rowNumber}: ${data}`;

    // Apply the animation class to highlight the row
    requestedRow.classList.add('highlighted-row');

    // Remove the animation class after a short duration (e.g., 1 second)
    setTimeout(() => {
        requestedRow.classList.remove('highlighted-row');
    }, 400); // Adjust the duration in milliseconds as needed
}


//--------------------------------------------------------------------------
function exec_step_computations(op1, cmd, op2, next_step) {
    var report = `${op1} ${cmd} ${op2}`;
    console.log(op1, cmd, op2, next_step);
    var res = 0;
    switch (cmd) {
        case '+': res = op1 + op2; break;
        case '-': res = op1 - op2; break;
        case '*': res = op1 * op2; break;
        case '/': res = op1 / op2; break;
        //case 'write': res = op1; // can be emulated by '+0'
        default:
            const parts = next_step.replace(/\s+/g, '').split('/');
            const branch1 = parts[0]; // step 'numbers' need NOT to be numbers -- we can use labels as well!
            const branch2 = parts[1]; // parseInt(parts[1], 10);
            
            // all the above command merely leave next_step unchanged
            if (cmd == '>') {
                res = (op1 > op2);
            } else 
            if (cmd == '<') {
                res = (op1 < op2);
            } else 
            if ((cmd == '=')||(cmd == '==')) {
                res = (op1 == op2);
            }            
            next_step = res ? branch1 : branch2;
            res = res ? 1 : 0;

          //alert("Error: Invalid command " + cmd);
          break;
    }
    
    report += `--> ${res}; новий крок: ${next_step}`;
    document.all['op_report'].textContent = report;
    //next_step = parseInt(next_step, 10);

    return [res, next_step];
}
//--------------------------------------------------------------------------

// Event listener to add a new row
addRowButton.addEventListener('click', ()=>{addTableRow(currentRowNumber); currentRowNumber++;});

// Event listener to reset the table
resetTableButton.addEventListener('click', () => {
    resetTable();
    // Clear the blackboard content
    document.getElementById('blackboard').textContent = '';
});

function parse_table_row(highlightedRow) {
    return {
        rowNumber: highlightedRow.cells[0].textContent,
        firstDataSource: highlightedRow.cells[1].textContent,
        operation: highlightedRow.cells[2].textContent,
        secondDataSource: highlightedRow.cells[3].textContent,
        destination: highlightedRow.cells[4].textContent,
        nextStep: highlightedRow.cells[5].textContent
    };
}


// Event listener to handle the "Next step" button
nextStepButton.addEventListener('click', () => {
    const highlightedRow = tableBody.querySelector('.highlighted');
    if (highlightedRow) {
        // Extract data from the highlighted row and pass it to your custom function        
        const rowData = parse_table_row(highlightedRow);
        
        // Call your custom function here, passing rowData as arguments
        res = exec_step_computations( getBlackboardRow(rowData.firstDataSource), rowData.operation, getBlackboardRow(rowData.secondDataSource), rowData.nextStep );
        if (rowData.destination.trim().length > 0) {
            updateBlackboardRow(rowData.destination, res[0]); // e.g., if operation can have no dest, but also it CAN have it!
        }
        console.log(res);

        // Unhighlight the current row
        highlightedRow.classList.remove('highlighted');

        // Highlight the next row (if exists)
        const nextRow = Array.from(tableBody.querySelectorAll('tr')).find(row => {
            return row.cells[0].textContent === String(res[1]);
        });

        if (nextRow) {
            nextRow.classList.add('highlighted');
        } else {
            alert('Виконання програми завершено (невідомо, на який крок переходити далі)');
        }
    }
});

tableBody.addEventListener('click', (event) => {
    // Event listener to move rows up
    if (event.target.classList.contains('move-up')) {
        const currentRow = event.target.parentElement.parentElement;
        const previousRow = currentRow.previousElementSibling;

        if (previousRow) {
            tableBody.insertBefore(currentRow, previousRow);
        }
    }

    // Event listener to move rows down
    if (event.target.classList.contains('move-down')) {
        const currentRow = event.target.parentElement.parentElement;
        const nextRow = currentRow.nextElementSibling;

        if (nextRow) {
            tableBody.insertBefore(nextRow, currentRow);
        }
    }

    // Event listener to delete a table row when the Delete button is clicked
    if (event.target.classList.contains('delete-row')) {
        const currentRow = event.target.parentElement.parentElement;
        currentRow.remove();
    }
});


tableBody.addEventListener('input', (event) => {
    const editedCell = event.target;
    const editedRow = editedCell.parentElement;
    const rowData = parse_table_row(editedRow );
    editedRow.cells[6].innerHTML = make_description( 
        [rowData.firstDataSource, rowData.operation, rowData.secondDataSource, rowData.destination, rowData.nextStep]
    );
});

/*


1	81	+	0	#1	k	тут вводиться значення x
k	1	+	0	#2	3	1 -> s
3	#1	/	#2	#3	4	x/s -> row3
4	#3	-	#2	#3	5	x/s - s == row3 - s -> row3
5	#3	/	2	#3	6	row3/2 -> row3
6	0	+	#3	#4	7	row3 -> row4
7	#4	<	0		8/else	row4 < 0 => compute abs
8	0	-	#4	#4	else	-row4 -> row4
else	#4	<	0.0001		/10	|row3| < thresh => exit
10	#3	+	#2	#2	3	s += row3 ; repeat
    

// for(var i=0; i<10000; i++) document.all['next-step'].click();

*/