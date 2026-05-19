document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }

    if (!isLoggedIn()) {
        window.location.href = '../auth/login.html';
        return;
    }

    loadPaymentMethods();

    document.getElementById('paymentMethodForm').addEventListener('submit', handleMethodFormSubmit);
    document.getElementById('refreshMethods').addEventListener('click', function(e) {
        e.preventDefault();
        loadPaymentMethods();
    });
});

async function loadPaymentMethods() {
    try {
        const response = await apiRequest('/api/payment-methods');
        const listContainer = document.getElementById('paymentMethodsList');

        if (!response.paymentMethods || response.paymentMethods.length === 0) {
            listContainer.innerHTML = `<div class="user-card" style="padding: 25px; text-align: center;">No payment methods saved yet. Add one using the form.</div>`;
            return;
        }

        listContainer.innerHTML = response.paymentMethods.map(method => renderMethodCard(method)).join('');
    } catch (error) {
        console.error('Load payment methods error:', error);
        const listContainer = document.getElementById('paymentMethodsList');
        listContainer.innerHTML = `<div class="user-card" style="padding: 25px; text-align: center; color: #dc2626;">Unable to load payment methods. Please refresh or try again later.</div>`;
    }
}

function renderMethodCard(method) {
    const methodNameJson = JSON.stringify(method.methodName);
    const accountNumberJson = JSON.stringify(method.accountNumber);
    const businessNameJson = JSON.stringify(method.businessName);

    return `
        <div class="user-card" style="margin-bottom: 16px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 14px;">
            <div style="flex: 1; min-width: 220px;">
                <strong style="display: block; margin-bottom: 6px;">${method.businessName}</strong>
                <span style="display: block; color: #555;">Type: ${method.methodName.toUpperCase()}</span>
                <span style="display: block; color: #555;">Number: ${method.accountNumber}</span>
                <span style="display: block; color: #555;">Default: ${method.isDefault ? 'Yes' : 'No'}</span>
            </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="btn btn-secondary" onclick="editPaymentMethod('${method._id}', ${methodNameJson}, ${accountNumberJson}, ${businessNameJson}, ${method.isDefault})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger" onclick="deletePaymentMethod('${method._id}')">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
                ${method.isDefault ? '' : `<button class="btn btn-primary" onclick="setDefaultMethod('${method._id}')"><i class="fas fa-star"></i> Set Default</button>`}
            </div>
        </div>
    `;
}

async function handleMethodFormSubmit(event) {
    event.preventDefault();
    hideAlert('paymentMethodSuccess');
    hideAlert('paymentMethodError');

    const methodId = document.getElementById('methodId').value;
    const methodName = document.getElementById('methodName').value;
    const accountNumber = document.getElementById('accountNumber').value.trim();
    const businessName = document.getElementById('businessName').value.trim();
    const isDefault = document.getElementById('isDefault').checked;

    if (!methodName || !accountNumber || !businessName) {
        showAlert('error', 'Please complete all fields before saving.', 'paymentMethodError');
        return;
    }

    try {
        const payload = { methodName, accountNumber, businessName, isDefault };
        let response;

        if (methodId) {
            response = await apiRequest(`/api/payment-methods/${methodId}`, 'PUT', payload);
        } else {
            response = await apiRequest('/api/payment-methods', 'POST', payload);
        }

        showAlert('success', `Payment method ${methodId ? 'updated' : 'saved'} successfully.`, 'paymentMethodSuccess');
        resetMethodForm();
        loadPaymentMethods();
    } catch (error) {
        console.error('Save payment method error:', error);
        showAlert('error', error.message || 'Unable to save payment method.', 'paymentMethodError');
    }
}

function editPaymentMethod(id, methodName, accountNumber, businessName, isDefault) {
    document.getElementById('methodId').value = id;
    document.getElementById('methodName').value = methodName;
    document.getElementById('accountNumber').value = accountNumber;
    document.getElementById('businessName').value = businessName;
    document.getElementById('isDefault').checked = isDefault;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deletePaymentMethod(id) {
    if (!confirm('Delete this payment method?')) return;

    try {
        await apiRequest(`/api/payment-methods/${id}`, 'DELETE');
        showAlert('success', 'Payment method deleted successfully.', 'paymentMethodSuccess');
        loadPaymentMethods();
    } catch (error) {
        console.error('Delete payment method error:', error);
        showAlert('error', 'Unable to delete payment method.', 'paymentMethodError');
    }
}

async function setDefaultMethod(id) {
    try {
        await apiRequest(`/api/payment-methods/${id}`, 'PUT', { isDefault: true });
        showAlert('success', 'Default payment method updated.', 'paymentMethodSuccess');
        loadPaymentMethods();
    } catch (error) {
        console.error('Set default method error:', error);
        showAlert('error', 'Unable to set default payment method.', 'paymentMethodError');
    }
}

function resetMethodForm() {
    document.getElementById('methodId').value = '';
    document.getElementById('methodName').value = 'paybill';
    document.getElementById('accountNumber').value = '';
    document.getElementById('businessName').value = '';
    document.getElementById('isDefault').checked = false;
}
