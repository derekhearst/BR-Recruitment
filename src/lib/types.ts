export type Appointment = {
	id: string | undefined | number
	locationId: number
	name: string
	status: string
	start: string
	end: string
	notes: string
	workLocation: string
	division: string
}

export type locationData = {
	id: number
	name: string
	availableSlots: number
	isHardCap: boolean
	timeSlots: [
		{
			id: number
			locationId: number
			start: string
			end: string
		}
	]
}
