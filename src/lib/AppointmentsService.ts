import type { Appointment } from '$lib/types'

export async function updateAppointment(id: string | number, appointment: Appointment, token: string) {
	const res = await fetch(`https://brrecruitment.azurewebsites.net/appointments/${id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify(appointment)
	})

	if (!res.ok) {
		throw new Error('Failed to update appointment')
	}
	return true
}

export async function createAppointment(appointment: Appointment, token: string) {
	const res = await fetch(`https://brrecruitment.azurewebsites.net/appointments/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify(appointment)
	})

	if (!res.ok) {
		throw new Error('Failed to create appointment')
	}
}

export async function deleteAppointment(id: string | number, token: string) {
	const res = await fetch(`https://brrecruitment.azurewebsites.net/appointments/${id}`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${token}`
		}
	})
	if (!res.ok) {
		throw new Error('Failed to delete appointment')
	}
}
