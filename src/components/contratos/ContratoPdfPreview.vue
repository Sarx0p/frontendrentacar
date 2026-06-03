<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-[60] overflow-y-auto bg-black/50 p-4" @click.self="$emit('cerrar')">
      <div class="max-w-3xl mx-auto my-4 bg-white rounded-lg shadow-2xl print:shadow-none print:my-0" id="contrato-pdf">
        <div class="bg-red-800 text-white px-6 py-4 text-center print:bg-red-800">
          <h1 class="text-xl font-extrabold tracking-wide">RENTACAR EL GUAYABO</h1>
          <p class="text-sm opacity-90">Contrato de arrendamiento de vehículo</p>
          <p class="text-xs mt-1 font-mono">{{ contrato?.numero_contrato }}</p>
        </div>
        <div class="p-6 space-y-4 text-sm text-gray-800">
          <section>
            <h2 class="font-bold border-b border-gray-300 pb-1 mb-2">DATOS DEL CLIENTE</h2>
            <p><strong>Nombre:</strong> {{ contrato?.reserva?.cliente?.nombre }}</p>
            <p><strong>DUI:</strong> {{ contrato?.reserva?.cliente?.dui }}</p>
            <p><strong>Teléfono:</strong> {{ contrato?.reserva?.cliente?.telefono }}</p>
          </section>
          <section>
            <h2 class="font-bold border-b border-gray-300 pb-1 mb-2">VEHÍCULO</h2>
            <p><strong>Vehículo:</strong> {{ nombreVehiculo(contrato?.reserva?.vehiculo) }}</p>
            <p><strong>Placa:</strong> {{ contrato?.reserva?.vehiculo?.placa }} · <strong>Color:</strong> {{ contrato?.reserva?.vehiculo?.color }}</p>
          </section>
          <section>
            <h2 class="font-bold border-b border-gray-300 pb-1 mb-2">PERIODO DE RENTA</h2>
            <p><strong>Entrega:</strong> {{ fmt(contrato?.fecha_hora_entrega) }}</p>
            <p><strong>Devolución:</strong> {{ fmt(contrato?.fecha_hora_devolucion) }}</p>
            <p><strong>Días acordados:</strong> {{ contrato?.dias_acordados }}</p>
          </section>
          <section>
            <h2 class="font-bold border-b border-gray-300 pb-1 mb-2">TARIFAS</h2>
            <p><strong>Precio por día:</strong> ${{ formatPrecio(contrato?.precio_por_dia) }}</p>
            <p><strong>Descuento:</strong> ${{ formatPrecio(contrato?.monto_descuento) }}</p>
            <p class="text-lg font-extrabold text-red-800"><strong>TOTAL:</strong> ${{ formatPrecio(contrato?.monto_total_renta) }}</p>
          </section>
          <section>
            <h2 class="font-bold border-b border-gray-300 pb-1 mb-2">ENTREGA — ESTADO DEL VEHÍCULO</h2>
            <p><strong>Combustible:</strong> {{ contrato?.nivel_combustible_entrega }}</p>
            <p><strong>Observaciones:</strong> {{ contrato?.observaciones_entrega || 'Sin observaciones' }}</p>
          </section>
          <div class="grid grid-cols-2 gap-8 pt-8 mt-8 border-t">
            <div class="text-center"><div class="border-t border-gray-400 pt-2 mt-12">Firma cliente</div></div>
            <div class="text-center"><div class="border-t border-gray-400 pt-2 mt-12">Firma RentaCar</div></div>
          </div>
        </div>
        <div class="flex gap-3 p-4 border-t print:hidden">
          <button type="button" class="flex-1 py-2 rounded-lg border font-bold" @click="$emit('cerrar')">Cerrar</button>
          <button type="button" class="flex-1 py-2 rounded-lg text-white font-bold" style="background:#922b21;" @click="imprimir">
            <i class="pi pi-print mr-1"></i> Imprimir / PDF
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { nombreVehiculo, formatPrecio, formatFechaHora12 } from '@/utils/contratoFormatters'

defineProps({
  visible:  { type: Boolean, default: false },
  contrato: { type: Object, default: null },
})

defineEmits(['cerrar'])

function fmt(v) {
  return formatFechaHora12(v)
}

function imprimir() {
  window.print()
}
</script>

<style>
@media print {
  body * { visibility: hidden; }
  #contrato-pdf, #contrato-pdf * { visibility: visible; }
  #contrato-pdf { position: absolute; left: 0; top: 0; width: 100%; }
}
</style>
