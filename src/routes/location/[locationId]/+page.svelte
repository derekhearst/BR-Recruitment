<script lang="ts">
	import Modal from '$lib/Modal.svelte'
	import type { Appointment, DTOAppointment } from '$lib/types'
	import { updateAppointment, createAppointment, deleteAppointment } from '$lib/AppointmentsService'
	import { page } from '$app/stores'
	import Swal from 'sweetalert2'
	import type { PageData } from './$types'
	import { goto, invalidate, invalidateAll } from '$app/navigation'
	export let data: PageData

	let editingAppointment: Appointment | DTOAppointment | undefined = undefined
	let modalTitle = 'Edit Appointment'
	let modalOpen = false
	let showWeekends = false

	$: filteredDates = data.dates.filter((e) => {
		if (showWeekends) return true
		if (e.getDay() == 0 || e.getDate() == 4) return false
		return true
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
	async function createModal(date: Date) {
		modalTitle = 'New Appointment'
		// @ts-expect-error - is is a DTOAppointment
		editingAppointment = {
			start: date.toLocaleDateString()
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

	async function removeAppointment(appointmentId: string) {
		try {
			deleteAppointment(appointmentId, data.session?.accessToken ?? '')
			Swal.fire({
				title: 'Appointment deleted',
				icon: 'success',
				position: 'top-right',
				showConfirmButton: false,
				toast: true,
				timer: 2000,
				timerProgressBar: true
			})
			modalOpen = false
			invalidateAll()
		} catch (e) {
			Swal.fire('Error', 'Appointment not deleted', 'error')
			console.log(e)
		}
	}

	$: searchedForWeek = Date.parse($page.url.searchParams.get('date') as string)
	async function nextWeek() {
		if (isNaN(searchedForWeek)) {
			goto('/location/' + $page.params.locationId + '?date=' + new Date().toISOString().split('T')[0])
		}
	}
</script>

<svelte:head>
	<title>Calendar</title>
</svelte:head>

<div class="paginationButtons flex flex-col items-center justify-evenly gap-2 pb-4">
	<h1 class="text-center text-5xl">Appointments for {location?.name}</h1>
	<form action="">
		<button type="button" class="styledButton">Last Week</button>
		<input name="date" type="date" value={$page.url.searchParams.get('date')} />
		<button class="styledButton"> Search</button>
		<button type="button" class="styledButton">Next Week</button>
	</form>
	<div class="flex items-center gap-2">
		<input type="checkbox" bind:checked={showWeekends} />
		<label for="showWeekends">Show Weekends</label>
	</div>
</div>

<div class="flex flex-wrap items-center justify-evenly gap-8 px-4 md:items-baseline">
	{#each filteredDates as date}
		<div class="flex flex-1 flex-col ">
			<div class="flex flex-col-reverse items-center gap-3 rounded-xl p-3">
				<h1 class="-mt-2 text-2xl">{date.toLocaleDateString()} - {date.toLocaleDateString([], { weekday: 'long' })}</h1>
				<button on:click={() => createModal(date)} class="self-center rounded-lg bg-red-700 p-1 px-2 text-white ">New Appointment</button>
			</div>
			<div class="flex flex-col gap-4">
				{#each location?.timeSlots ?? [] as timeSlot}
					<h2 class="border-black text-center text-xl text-black/80">{timeSlot.start}</h2>
					<div class="flex flex-col gap-1">
						{#each data.appointments as appointment}
							{#if new Date(date.toLocaleDateString() + ' ' + timeSlot.start) == new Date(appointment.start)}
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
										class="truncate rounded-lg bg-white p-1 shadow-lg">
										{new Date(appointment.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} - {appointment.name}
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
				{#if editingAppointment?.id}
					<button type="button" on:click={() => removeAppointment(editingAppointment?.id ?? '')}>Delete</button>
				{/if}
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
