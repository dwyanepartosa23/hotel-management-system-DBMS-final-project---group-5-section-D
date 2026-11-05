// Contributor: Ricaplaza
const reservationForm = document.getElementById('reservation-form');

if (reservationForm) {
    reservationForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const submitButton = reservationForm.querySelector(
            'button[type="submit"]'
        );

        const originalText = submitButton.textContent;
        const formData = new FormData(reservationForm);

        const reservationData = {
            guest_name: formData.get('guest_name').trim(),
            email: formData.get('email').trim(),
            phone: formData.get('phone').trim(),
            room_type: formData.get('room_type'),
            check_in: formData.get('check_in'),
            check_out: formData.get('check_out'),
            guests: Number(formData.get('guests')),
            special_requests: formData.get('special_requests').trim()
        };

        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Processing Reservation...';

            const response = await fetch('/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reservationData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Unable to process reservation.'
                );
            }

            alert(
                `Reservation successful!\n\n` +
                `Reservation ID: ${result.data.reservation_id}\n` +
                `Guest Name: ${result.data.guest_name}\n` +
                `Room Number: ${result.data.room_number}\n` +
                `Room Type: ${result.data.room_type}\n` +
                `Check-in: ${result.data.check_in}\n` +
                `Check-out: ${result.data.check_out}\n\n` +
                `Thank you for choosing Lumière Grand!`
            );

            reservationForm.reset();

        } catch (error) {
            alert(error.message);
            console.error('Reservation error:', error);

        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}
