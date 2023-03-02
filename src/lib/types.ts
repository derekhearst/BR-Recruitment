export type Appointment = {
	id: number
	locationId: number
	location: {
		id: number
		name: string
	}
	name: string
	status: string
	start: string
	end: string
	notes: string
	createBy: string | null
	createDate: Date | null
	editBy: string | null
	editDate: Date | null
}

export type DTOAppointment = {
	locationId: number
	name: string
	status: string
	start: string
	end: string
	notes: string
}