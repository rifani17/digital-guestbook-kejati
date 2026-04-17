import { supabase } from './supabase'

const DATE_VALIDATION_ERROR = { message: 'Tanggal akhir tidak boleh sebelum tanggal mulai' }

function isDateRangeValid(tanggal_mulai, tanggal_akhir) {
  return tanggal_akhir >= tanggal_mulai
}

export async function fetchAgenda() {
  const { data, error } = await supabase
    .from('agenda')
    .select('*')
    .order('tanggal_mulai', { ascending: true })
  return { data, error }
}

export async function createAgenda({ nama_agenda, tanggal_mulai, tanggal_akhir, waktu, tempat }) {
  if (!isDateRangeValid(tanggal_mulai, tanggal_akhir)) {
    return { data: null, error: DATE_VALIDATION_ERROR }
  }
  const { data, error } = await supabase
    .from('agenda')
    .insert([{ nama_agenda, tanggal_mulai, tanggal_akhir, waktu, tempat }])
    .select()
  return { data, error }
}

export async function updateAgenda(id_agenda, { nama_agenda, tanggal_mulai, tanggal_akhir, waktu, tempat }) {
  if (!isDateRangeValid(tanggal_mulai, tanggal_akhir)) {
    return { data: null, error: DATE_VALIDATION_ERROR }
  }
  const { data, error } = await supabase
    .from('agenda')
    .update({ nama_agenda, tanggal_mulai, tanggal_akhir, waktu, tempat })
    .eq('id_agenda', id_agenda)
    .select()
  return { data, error }
}

export async function deleteAgenda(id_agenda) {
  const { error } = await supabase
    .from('agenda')
    .delete()
    .eq('id_agenda', id_agenda)
  return { error }
}
