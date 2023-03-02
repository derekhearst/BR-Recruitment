import type { DTOAppointment } from '$lib/types'

export async function updateAppointment(id: number, appointment: DTOAppointment, token: string) {
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

export async function createAppointment(appointment: DTOAppointment, token: string) {
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
