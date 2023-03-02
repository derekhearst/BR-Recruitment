<script lang="ts">
	import Modal from '$lib/Modal.svelte'
	import type { Appointment, DTOAppointment } from '$lib/types'
	import { updateAppointment, createAppointment } from '$lib/AppointmentsService'
	import Swal from 'sweetalert2'
	import type { PageData } from './$types'
	export let data: PageData

	let editingAppointment: Appointment | DTOAppointment | undefined = undefined
	let modalTitle = 'Edit Appointment'
	let modalOpen = false
	async function setStatus(appointment: Appointment, status: string) {
		console.log('Setting status to ' + status)
	}

	async function editModal(appointment: Appointment) {
		modalTitle = 'Edit Appointment'
		editingAppointment = appointment
		modalOpen = true
	}

	async function createModal(date: string) {
		modalTitle = 'New Appointment'
		// @ts-expect-error - is is a DTOAppointment
		editingAppointment = {
			start: date
		}
		modalOpen = true
	}

	async function saveAppointment(e: Event) {
		const formData = new FormData(e.target as HTMLFormElement)
		const fullDate = new Date(formData.get('date') + ' : ' + formData.get('time'))

		const appointment: DTOAppointment = {
			locationId: parseInt(formData.get('location') as string),
			name: formData.get('name') as string,
			start: fullDate.toISOString(),
			end: fullDate.toISOString(),
			status: formData.get('status') as string,
			notes: formData.get('notes') as string
		}
		const appointmentId = parseInt(formData.get('id') as string)

		if (appointmentId) {
			console.log('isPut')
			try {
				await updateAppointment(appointmentId, appointment, data.session?.accessToken ?? '')
				Swal.fire('Success', 'Appointment updated', 'success')
			} catch (e) {
				Swal.fire('Error', 'Appointment not updated', 'error')
				console.log(e)
			}
		} else {
			console.log('isPost')
			try {
				await createAppointment(appointment, data.session?.accessToken ?? '')
				Swal.fire('Success', 'Appointment created', 'success')
			} catch (e) {
				Swal.fire('Error', 'Appointment not created', 'error')
				console.log(e)
			}
		}
	}
</script>

<svelte:head>
	<title>Calendar</title>
</svelte:head>
<h1 class="pb-10 text-center text-5xl">Appointments for {data.locationName}</h1>

<div class=" paginationButtons flex justify-evenly pb-4">
	<button class="styledButton">Previous Week</button>
	<button class="styledButton">Current Week</button>
	<button class="styledButton">Next Week</button>
</div>
<div class="flex flex-wrap justify-evenly gap-4  px-10">
	{#each [...data.mappedAppointments] as [date, timeSlots]}
		<div class="flex-grow rounded-md border-2 p-4 shadow-md">
			<h1 class="mb-2 text-center text-3xl text-blue-600">{date}</h1>
			<button on:click={() => createModal(date)} class="w-full rounded-md bg-blue-300 px-2 py-2">New Appointment</button>
			{#each [...timeSlots] as [timeSlot, appointments]}
				<div class="">
					<h2 class="my-4 text-center text-xl">{timeSlot}</h2>
					{#each [...appointments] as [id, appointment]}
						<button
							title="Right click to edit, left click to cycle through statuses"
							class="w-full rounded-lg border-2 p-2"
							class:noShow={appointment.status == 'noShow'}
							class:processed={appointment.status == 'processed'}
							on:click={() => {
								if (appointment.status == 'processed') {
									appointment.status = 'noShow'
									setStatus(appointment, 'noShow')
								} else if (appointment.status == 'noShow') {
									appointment.status = 'pending'
									setStatus(appointment, 'pending')
								} else if (appointment.status == 'pending') {
									appointment.status = 'processed'
									setStatus(appointment, 'processed')
								}
							}}
							on:contextmenu|preventDefault={() => {
								editModal(appointment)
							}}>
							{appointment.name} - {appointment.status}
						</button>
					{/each}
				</div>
			{/each}
		</div>
	{/each}
</div>

<Modal bind:modalOpen>
	<div class="flex flex-col gap-4 rounded bg-white p-4 text-lg" on:click|stopPropagation on:keypress|stopPropagation>
		<h1 class="text-2xl">{modalTitle}</h1>
		<form class="flex flex-col gap-2" on:submit|preventDefault={saveAppointment}>
			<label for="name">
				Name:
				<input type="text" autofocus name="name" required id="name" value={editingAppointment?.name ?? ''} />
			</label>
			<label for="status">
				Status:
				<select name="status" required id="status">
					<option value="Pending" selected={editingAppointment?.status == 'Pending'}>Pending</option>
					<option value="processed" selected={editingAppointment?.status == 'processed'}>Processed</option>
					<option value="noShow" selected={editingAppointment?.status == 'noShow'}>No Show</option>
				</select>
			</label>
			<label for="date">
				Date:
				<input
					type="date"
					name="date"
					required
					id="date"
					value={new Date(editingAppointment?.start ?? new Date()).toISOString().substring(0, 10)} />
			</label>
			<label for="time">
				Time:
				<select name="time" required id="time">
					{#each data.allowedTimeSlots as timeSlot}
						<option
							value={timeSlot}
							selected={timeSlot ==
								new Date(editingAppointment?.start ?? new Date()).toLocaleTimeString([], {
									hour: '2-digit',
									minute: '2-digit'
								})}>
							{timeSlot}
						</option>
					{/each}
				</select>
			</label>
			<label for="location">
				Location:
				<select name="location" required id="location">
					{#each data.allowedLocations as location}
						<option value={location.id} selected={location.id == editingAppointment?.locationId}>
							{location.name}
						</option>
					{/each}
				</select></label>
			<label for="notes" class="flex-col">
				Notes:
				<textarea name="notes" id="notes" rows="5" cols="50" value={editingAppointment?.notes ?? ''} />
			</label>
			<input type="hidden" name="id" value={editingAppointment?.id ?? ''} />
			<div class="flex justify-between">
				<button type="button" class="styledButton" on:click={() => (modalOpen = false)}>Cancel</button>
				<button type="submit" class="styledButton bg-blue-500 ">Save</button>
			</div>
		</form>
	</div>
</Modal>

<style>
	.processed {
		background-color: yellow;
	}
	.noShow {
		background-color: lightcoral;
	}
	label {
		display: flex;

		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}
</style>
