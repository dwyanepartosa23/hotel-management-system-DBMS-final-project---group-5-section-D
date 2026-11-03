let editingEmployeeId = null;

function getPositionName(positionId) {
    const positions = {
        31: 'Manager',
        32: 'Receptionist',
        33: 'House keeper',
        34: 'Maintenance staff',
        35: 'Accountant',
        36: 'Hotel staff'
    };

    return positions[positionId] || 'Unknown';
}

// FORM VALIDATION
function validateEmployeeData(employeeData) {

    if (!employeeData.first_name.trim()) {
        alert('Please enter the employee first name.');
        return false;
    }

    if (!employeeData.last_name.trim()) {
        alert('Please enter the employee last name.');
        return false;
    }

    if (!employeeData.phone.trim()) {
        alert('Please enter the employee phone number.');
        return false;
    }

    const phonePattern = /^[0-9]{10,15}$/;

    if (!phonePattern.test(employeeData.phone.trim())) {
        alert('Please enter a valid phone number using 10 to 15 digits.');
        return false;
    }

    if (!employeeData.email.trim()) {
        alert('Please enter the employee email address.');
        return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(employeeData.email.trim())) {
        alert('Please enter a valid email address.');
        return false;
    }

    if (!employeeData.position_id) {
        alert('Please select an employee position.');
        return false;
    }

    return true;
}

// LOAD EMPLOYEES
async function loadEmployees() {
    try {
        const response = await fetch('/api/employees');
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to load employees.');
        }

        const employees = result.data;
        const tableBody = document.getElementById('employeeTableBody');
        const totalEmployees = document.getElementById('totalEmployees');

        totalEmployees.textContent = employees.length;
        tableBody.innerHTML = '';

        if (employees.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">No employees found.</td>
                </tr>
            `;
            return;
        }

        employees.forEach(employee => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${employee.employee_id}</td>
                <td>${employee.first_name} ${employee.last_name}</td>
                <td>${employee.phone || 'N/A'}</td>
                <td>${employee.email || 'N/A'}</td>
                <td>${employee.position_name || 'Unknown'}</td>
                <td>
                    <button class="edit-btn" data-id="${employee.employee_id}">
                        Edit
                    </button>

                    <button class="delete-btn" data-id="${employee.employee_id}">
                        Delete
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Error loading employees:', error);
    }
}

// ADD OR UPDATE EMPLOYEE
const employeeFormElement = document.getElementById('employeeForm');
const saveButton = employeeFormElement.querySelector('button[type="submit"]');
const formHeading = employeeFormElement.querySelector('h2');

employeeFormElement.addEventListener('submit', async function(event) {
    event.preventDefault();

    const employeeData = {
        first_name: document.getElementById('first_name').value.trim(),
        last_name: document.getElementById('last_name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        position_id: Number(document.getElementById('position_id').value)
    };

    // CHECK FORM DATA BEFORE SAVING
    if (!validateEmployeeData(employeeData)) {
        return;
    }

    try {
        const isEditing = editingEmployeeId !== null;

        const url = isEditing
            ? `/api/employees/${editingEmployeeId}`
            : '/api/employees';

        const response = await fetch(url, {
            method: isEditing ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employeeData)
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            alert(result.message || 'Unable to save employee.');
            return;
        }

        alert(isEditing
            ? 'Employee updated successfully!'
            : 'Employee added successfully!');

        resetEmployeeForm();
        await loadEmployees();

    } catch (error) {
        console.error('Error saving employee:', error);
        alert('Something went wrong while saving the employee.');
    }
});

// EDIT AND DELETE BUTTONS
document.getElementById('employeeTableBody').addEventListener('click', async function(event) {

    const button = event.target.closest('button');

    if (!button) return;

    const employeeId = button.dataset.id;

    // EDIT EMPLOYEE
    if (button.classList.contains('edit-btn')) {

        try {
            const response = await fetch('/api/employees');
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to load employee.');
            }

            const employee = result.data.find(
                item => item.employee_id == employeeId
            );

            if (!employee) {
                alert('Employee not found.');
                return;
            }

            editingEmployeeId = employee.employee_id;

            document.getElementById('first_name').value = employee.first_name;
            document.getElementById('last_name').value = employee.last_name;
            document.getElementById('phone').value = employee.phone || '';
            document.getElementById('email').value = employee.email || '';
            document.getElementById('position_id').value = employee.position_id;

            employeeFormElement.style.display = 'block';

            formHeading.textContent = 'Edit Employee';
            saveButton.textContent = 'Save Changes';

            employeeFormElement.scrollIntoView({
                behavior: 'smooth'
            });

        } catch (error) {
            console.error('Error editing employee:', error);
            alert('Unable to load employee information.');
        }
    }

    // DELETE EMPLOYEE
    if (button.classList.contains('delete-btn')) {

        const confirmed = confirm(
            'Are you sure you want to delete this employee?'
        );

        if (!confirmed) return;

        try {
            const response = await fetch(`/api/employees/${employeeId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                alert(result.message || 'Unable to delete employee.');
                return;
            }

            alert('Employee deleted successfully!');

            await loadEmployees();

        } catch (error) {
            console.error('Error deleting employee:', error);
            alert('Something went wrong while deleting the employee.');
        }
    }
});

// RESET FORM
function resetEmployeeForm() {
    editingEmployeeId = null;

    employeeFormElement.reset();
    employeeFormElement.style.display = 'none';

    formHeading.textContent = 'Add Employee';
    saveButton.textContent = 'Save Employee';
}

// CANCEL BUTTON
document.getElementById('cancelEmployeeBtn').addEventListener('click', function() {
    resetEmployeeForm();
});

// INITIAL LOAD
loadEmployees();