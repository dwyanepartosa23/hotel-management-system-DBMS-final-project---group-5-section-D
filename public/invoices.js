// Contributor: [Your Name]
// Module: Invoice Frontend

const API_BASE = '/api/invoices';

// DOM Elements
const form = document.getElementById('invoice-form');
const formTitle = document.getElementById('form-title');
const invoiceIdInput = document.getElementById('invoice-id');
const reservationIdInput = document.getElementById('reservation-id');
const invoiceDateInput = document.getElementById('invoice-date');
const roomChargesInput = document.getElementById('room-charges');
const serviceChargesInput = document.getElementById('service-charges');
const statusInput = document.getElementById('invoice-status');
const submitBtn = document.getElementById('submit-button');
const cancelBtn = document.getElementById('cancel-button');
const formMessage = document.getElementById('form-message');
const tableBody = document.getElementById('invoice-table-body');
const tableMessage = document.getElementById('table-message');
const reportBtn = document.getElementById('report-button');
const reportMessage = document.getElementById('report-message');
const reportTableBody = document.getElementById('report-table-body');

// Load all invoices on page load
document.addEventListener('DOMContentLoaded', loadInvoices);

// Form submit handler
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const invoiceId = invoiceIdInput.value;
    const data = {
        reservations_id: Number(reservationIdInput.value),
        invoice_date: invoiceDateInput.value || null,
        room_charges: Number(roomChargesInput.value),
        service_charges: Number(serviceChargesInput.value),
        invoice_status: statusInput.value
    };

    try {
        let res;
        if (invoiceId) {
            // Update existing
            res = await fetch(`${API_BASE}/${invoiceId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            // Create new
            res = await fetch(API_BASE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }

        const result = await res.json();
        
        if (!res.ok) throw new Error(result.message || 'Failed to save');

        showMessage(formMessage, result.message, 'success');
        resetForm();
        await loadInvoices();
    } catch (err) {
        showMessage(formMessage, err.message, 'error');
    }
});

// Cancel edit
cancelBtn.addEventListener('click', resetForm);

// Report button
reportBtn.addEventListener('click', async () => {
    try {
        reportMessage.textContent = 'Loading...';
        const res = await fetch(`${API_BASE}/payment-report`);
        const result = await res.json();
        
        if (!res.ok) throw new Error(result.message);
        
        renderReport(result.data);
        reportMessage.textContent = '';
    } catch (err) {
        showMessage(reportMessage, err.message, 'error');
    }
});

// Load invoices list
async function loadInvoices() {
    try {
        tableMessage.textContent = 'Loading...';
        const res = await fetch(API_BASE);
        const result = await res.json();
        
        if (!res.ok) throw new Error(result.message);
        
        renderTable(result.data);
        tableMessage.textContent = '';
    } catch (err) {
        showMessage(tableMessage, err.message, 'error');
        tableBody.innerHTML = '';
    }
}

// Render main invoices table
function renderTable(invoices) {
    if (!invoices || invoices.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--taupe);padding:2rem;">No invoices yet. Create one above.</td></tr>';
        return;
    }

    tableBody.innerHTML = invoices.map(inv => `
        <tr>
            <td>${inv.invoices_id}</td>
            <td>${inv.reservations_id}</td>
            <td>${inv.guest_name || '—'}</td>
            <td>${inv.invoice_date || '—'}</td>
            <td>₱${Number(inv.room_charges).toFixed(2)}</td>
            <td>₱${Number(inv.service_charges).toFixed(2)}</td>
            <td><strong>₱${Number(inv.total_amount).toFixed(2)}</strong></td>
            <td>${inv.invoice_status}</td>
            <td class="row-actions">
                <button onclick="editInvoice(${inv.invoices_id})" class="btn" style="padding:0.4rem 0.8rem;font-size:0.75rem;">Edit</button>
                <button onclick="deleteInvoice(${inv.invoices_id})" class="btn" style="padding:0.4rem 0.8rem;font-size:0.75rem;background:#c62828;border-color:#c62828;">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Render report table
function renderReport(report) {
    if (!report || report.length === 0) {
        reportTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--taupe);padding:2rem;">No report data available.</td></tr>';
        return;
    }

    reportTableBody.innerHTML = report.map(r => `
        <tr>
            <td>${r.invoices_id}</td>
            <td>${r.reservations_id}</td>
            <td>${r.invoice_date || '—'}</td>
            <td>₱${Number(r.total_amount).toFixed(2)}</td>
            <td>₱${Number(r.total_paid).toFixed(2)}</td>
            <td style="font-weight:${r.remaining_balance > 0 ? 'bold' : 'normal'};color:${r.remaining_balance > 0 ? '#ff9800' : 'inherit'};">₱${Number(r.remaining_balance).toFixed(2)}</td>
            <td>${r.invoice_status}</td>
        </tr>
    `).join('');
}

// Edit invoice — fill form
window.editInvoice = async function(id) {
    try {
        formMessage.textContent = 'Loading...';
        const res = await fetch(`${API_BASE}/${id}`);
        const result = await res.json();
        
        if (!res.ok) throw new Error(result.message);
        
        const inv = result.data;
        invoiceIdInput.value = inv.invoices_id;
        reservationIdInput.value = inv.reservations_id;
        invoiceDateInput.value = inv.invoice_date || '';
        roomChargesInput.value = Number(inv.room_charges);
        serviceChargesInput.value = Number(inv.service_charges);
        statusInput.value = inv.invoice_status;
        
        formTitle.textContent = 'Edit Invoice';
        submitBtn.textContent = 'Update Invoice';
        cancelBtn.hidden = false;
        formMessage.textContent = '';
    } catch (err) {
        showMessage(formMessage, err.message, 'error');
    }
};

// Delete invoice
window.deleteInvoice = async function(id) {
    if (!confirm('Delete this invoice? This cannot be undone.')) return;
    
    try {
        const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
        const result = await res.json();
        
        if (!res.ok) throw new Error(result.message);
        
        showMessage(tableMessage, result.message, 'success');
        await loadInvoices();
    } catch (err) {
        showMessage(tableMessage, err.message, 'error');
    }
};

// Reset form to create mode
function resetForm() {
    form.reset();
    invoiceIdInput.value = '';
    formTitle.textContent = 'Add Invoice';
    submitBtn.textContent = 'Save Invoice';
    cancelBtn.hidden = true;
    formMessage.textContent = '';
}

// Helper: Show styled messages
function showMessage(el, text, type) {
    el.textContent = text;
    el.className = `message ${type}`;
    setTimeout(() => { el.textContent = ''; el.className = 'message'; }, 5000);
}