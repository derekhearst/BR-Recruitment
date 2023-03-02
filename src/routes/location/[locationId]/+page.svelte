<script lang="ts">
	import Modal from '$lib/Modal.svelte'
	import type { Appointment, DTOAppointment } from '$lib/types'
	import { updateAppointment, createAppointment } from '$lib/AppointmentsService'
	import { page } from '$app/stores'
	import Swal from 'sweetalert2'
	import type { PageData } from './$types'
	import { invalidate, invalidateAll } from '$app/navigation'
	export let data: PageData

	let editingAppointment: Appointment | DTOAppointment | undefined = undefined
	let modalTitle = 'Edit Appointment'
	let modalOpen = false
	let showWeekends = true

	$: filteredDates = data.dates.filter((e) => {
		if (showWeekends) return true
		return e.getDay() != 0 && e.getDate() != 5
	})

	const location = data.locationData.find((e) => e.id === parseInt($page.params.locationId))

	async function setStatus(appointment: Appointment, status: string) {
		try {
			await updateAppointment(appointment.id, appointment, data.session?.accessToken ?? '')
		} catch (e) {
			Swal.fire('Error', 'Appointment not updated', 'error')
			console.log(e)
		}
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
		console.log(fullDate)

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
			console.log('isPut', appointment)
			try {
				await updateAppointment(appointmentId, appointment, data.session?.accessToken ?? '')
				invalidateAll()
				Swal.fire({
					title: 'Appointment updated',
					icon: 'success',
					position: 'top-right',
					showConfirmButton: false,
					toast: true,
					timer: 2000,
					timerProgressBar: true
				})
			} catch (e) {
				Swal.fire('Error', 'Appointment not updated', 'error')
				console.log(e)
			}
		} else {
			console.log('isPost')
			try {
				await createAppointment(appointment, data.session?.accessToken ?? '')
				Swal.fire({
					title: 'Appointment created',
					icon: 'success',
					position: 'top-right',
					showConfirmButton: false,
					toast: true,
					timer: 2000,
					timerProgressBar: true
				})
			} catch (e) {
				Swal.fire('Error', 'Appointment not created', 'error')
				console.log(e)
			}
		}
		modalOpen = false
	}
</script>

<svelte:head>
	<title>Calendar</title>
</svelte:head>

<h1 class="pb-10 text-center text-5xl">Appointments for {location?.name}</h1>

<div class=" paginationButtons flex justify-evenly pb-4">
	<form action="">
		<input name="date" type="date" value={$page.url.searchParams.get('date')} />
		<button class="styledButton"> Search</button>
	</form>
</div>

<div class="flex flex-wrap items-center justify-evenly gap-8 md:items-baseline md:gap-0 ">
	{#each filteredDates as date}
		<div class="flex flex-col rounded-md bg-gray-200 p-4 shadow-xl">
			<h1 class="-mt-2 text-2xl text-blue-600">{date.toLocaleDateString()} - {date.toLocaleDateString([], { weekday: 'long' })}</h1>

			<div class="flex flex-col gap-2">
				{#each location?.timeSlots ?? [] as timeSlot}
					<h2 class="border-b-2 border-black text-center text-xl">{timeSlot.start}</h2>
					<div class="flex flex-col gap-2">
						{#each data.appointments as appointment}
							{#if timeSlot.start == new Date(appointment.start).toLocaleTimeString( [], { hour: '2-digit', minute: '2-digit', hour12: true } )}
								{#if date.toLocaleDateString() == new Date(appointment.start).toLocaleDateString()}
									<button
										on:click={() => {
											if (appointment.status == 'pending') {
												appointment.status = 'processed'
												setStatus(appointment, 'processed')
											} else if (appointment.status == 'processed') {
												appointment.status = 'noShow'
												setStatus(appointment, 'noShow')
											} else if (appointment.status == 'noShow') {
												appointment.status = 'pending'
												setStatus(appointment, 'pending')
											}
										}}
										on:contextmenu|preventDefault={() => editModal(appointment)}
										title="Left click to change status, right click to edit."
										class:noShow={appointment.status == 'noShow'}
										class:processed={appointment.status == 'processed'}
										class="rounded-lg bg-gray-400 py-2 px-4">
										{appointment.name} - {appointment.status}
									</button>
								{/if}
							{/if}
						{/each}
					</div>
				{/each}
			</div>
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
					<option value="pending" selected={editingAppointment?.status == 'pending'}>Pending</option>
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
					{#each location?.timeSlots ?? [] as timeSlot}
						<option
							value={timeSlot.start}
							selected={timeSlot.start ==
								new Date(editingAppointment?.start ?? new Date()).toLocaleTimeString([], {
									hour: '2-digit',
									minute: '2-digit',
									hour12: true
								})}>
							{timeSlot.start}
						</option>
					{/each}
				</select>
			</label>
			<label for="location">
				Location:
				<select name="location" required id="location">
					{#each data.locationData as location}
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
