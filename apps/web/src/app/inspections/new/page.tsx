'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../../stores/auth.store';
import {
  ClipboardCheck,
  Car,
  User,
  Camera,
  Video,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  ArrowLeft,
  Check,
  Fuel,
  Upload,
  Gauge,
  Sparkles,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { FuelSlider } from '../../../components/ui/FuelSlider';
import { DamageMarkingCanvas } from '../../../components/ui/DamageMarkingCanvas';
import { Customer, Vehicle, DamageMarker } from '@automotive-os/types';

function NewInspectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialVehicleId = searchParams.get('vehicle_id');
  const initialCustomerId = searchParams.get('customer_id');

  const { api, user, currentLocation } = useAuthStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomerId || '');
  const [selectedVehicleId, setSelectedVehicleId] = useState(initialVehicleId || '');
  const [mileage, setMileage] = useState(142300);
  const [fuelLevel, setFuelLevel] = useState(75);
  const [customerComment, setCustomerComment] = useState('Плановое техническое обслуживание и диагностика');
  const [internalComment, setInternalComment] = useState('');

  // Checklist items (Section 66)
  const [checklist, setChecklist] = useState([
    { id: '1', category: 'body', name: 'Передний бампер и оптика', status: 'not_checked', comment: '' },
    { id: '2', category: 'body', name: 'Левая сторона (крылья, двери)', status: 'ok', comment: '' },
    { id: '3', category: 'body', name: 'Правая сторона (крылья, двери)', status: 'ok', comment: '' },
    { id: '4', category: 'body', name: 'Задняя часть и багажник', status: 'ok', comment: '' },
    { id: '5', category: 'body', name: 'Крыша и остекление', status: 'ok', comment: '' },
    { id: '6', category: 'interior', name: 'Передние сиденья и ремни', status: 'ok', comment: '' },
    { id: '7', category: 'interior', name: 'Задний ряд сидений', status: 'ok', comment: '' },
    { id: '8', category: 'interior', name: 'Приборная панель и мультимедиа', status: 'ok', comment: '' },
  ]);

  // Damage markers for photos (Section 67)
  const [damageMarkers, setDamageMarkers] = useState<DamageMarker[]>([
    { x: 50, y: 50, severity: 'minor', comment: 'Скол лакокрасочного покрытия' },
  ]);

  // Photo / video simulation states
  const [photosCount, setPhotosCount] = useState(4);
  const [hasVideo, setHasVideo] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, vRes] = await Promise.all([
          api.getCustomers({ limit: 100 }),
          api.getVehicles({ limit: 100 }),
        ]);
        setCustomers(cRes.data || []);
        setVehicles(vRes.data || []);

        if (initialVehicleId) {
          const veh = vRes.data?.find((v) => v.id === initialVehicleId);
          if (veh) {
            setSelectedVehicleId(veh.id);
            setSelectedCustomerId(veh.customer_id);
            setMileage(veh.mileage || 142300);
          }
        } else if (vRes.data && vRes.data.length > 0) {
          setSelectedVehicleId(vRes.data[0].id);
          setSelectedCustomerId(vRes.data[0].customer_id);
          setMileage(vRes.data[0].mileage || 142300);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [api, initialVehicleId]);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const handleChecklistChange = (id: string, status: string) => {
    setChecklist(checklist.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const handleFinishInspection = async () => {
    if (!selectedVehicleId || !selectedCustomerId) {
      alert('Пожалуйста, выберите автомобиль и клиента');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create inspection
      const insp = await api.createInspection({
        location_id: currentLocation?.id,
        vehicle_id: selectedVehicleId,
        customer_id: selectedCustomerId,
        mileage: Number(mileage),
        fuel_level: Number(fuelLevel),
        customer_comment: customerComment,
        internal_comment: internalComment,
        items: checklist,
        damage_markers: damageMarkers,
      });

      // 2. Complete inspection
      await api.completeInspection(insp.data.id);

      // 3. Create Work Order from inspection (Main business scenario Section 1 & 111)
      const wo = await api.createWorkOrder({
        location_id: currentLocation?.id,
        vehicle_id: selectedVehicleId,
        customer_id: selectedCustomerId,
        inspection_id: insp.data.id,
        mileage_in: Number(mileage),
        customer_complaint: customerComment,
        status: 'waiting_approval',
        items: [
          { type: 'labor', description: 'Замена моторного масла и фильтра', quantity: 1, unit_price: 4800 },
          { type: 'labor', description: 'Компьютерная диагностика систем', quantity: 1, unit_price: 2500 },
          { type: 'part', description: 'Масляный фильтр оригинальный', quantity: 1, unit_price: 800 },
        ],
      });

      // Navigate to created work order
      router.push(`/work-orders/${wo.data.id}`);
    } catch (err: any) {
      alert(err.message || 'Ошибка сохранения приемки');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-16 text-slate-500 text-sm">Подготовка мастера приемки...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-indigo-600" /> Новая приемка автомобиля
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Пошаговый мастер оформления визита и фиксации состояния автомобиля
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
          Шаг {step} из 4
        </span>
      </div>

      {/* Wizard Progress Bar */}
      <div className="grid grid-cols-4 gap-2">
        {['1. Данные авто', '2. Чек-лист', '3. Фото и дефекты', '4. Сохранение'].map((title, idx) => (
          <div
            key={idx}
            className={`h-2 rounded-full transition-all ${
              step > idx + 1 ? 'bg-emerald-500' : step === idx + 1 ? 'bg-indigo-600' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* STEP 1: CLIENT & VEHICLE (Section 65) */}
      {step === 1 && (
        <Card title="Шаг 1: Идентификация клиента и автомобиля">
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Клиент"
                value={selectedCustomerId}
                onChange={(e) => {
                  setSelectedCustomerId(e.target.value);
                  const relatedVeh = vehicles.find((v) => v.customer_id === e.target.value);
                  if (relatedVeh) setSelectedVehicleId(relatedVeh.id);
                }}
                options={customers.map((c) => ({
                  value: c.id,
                  label: `${c.first_name} ${c.last_name} (${c.phone})`,
                }))}
              />

              <Select
                label="Автомобиль"
                value={selectedVehicleId}
                onChange={(e) => {
                  setSelectedVehicleId(e.target.value);
                  const veh = vehicles.find((v) => v.id === e.target.value);
                  if (veh) {
                    setSelectedCustomerId(veh.customer_id);
                    setMileage(veh.mileage || mileage);
                  }
                }}
                options={vehicles.map((v) => ({
                  value: v.id,
                  label: `${v.make} ${v.model} [${v.license_plate}]`,
                }))}
              />
            </div>

            {selectedVehicle && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">VIN код:</span>
                  <p className="font-mono font-bold text-slate-800">{selectedVehicle.vin}</p>
                </div>
                <div>
                  <span className="text-slate-400">Госномер:</span>
                  <p className="font-mono font-bold text-slate-800">{selectedVehicle.license_plate}</p>
                </div>
                <div>
                  <span className="text-slate-400">Год / Цвет:</span>
                  <p className="font-semibold text-slate-800">{selectedVehicle.year} г. • {selectedVehicle.color || 'Черный'}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Текущий пробег (км)"
                type="number"
                icon={<Gauge className="w-4 h-4" />}
                value={mileage}
                onChange={(e) => setMileage(Number(e.target.value))}
                required
              />

              <FuelSlider value={fuelLevel} onChange={setFuelLevel} />
            </div>

            <Input
              label="Причина обращения / Жалоба клиента"
              value={customerComment}
              onChange={(e) => setCustomerComment(e.target.value)}
              placeholder="Опишите причину визита..."
            />

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button variant="primary" size="lg" onClick={() => setStep(2)}>
                <span>Начать осмотр (Шаг 2)</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 2: CHECKLIST (Section 66) */}
      {step === 2 && (
        <Card title="Шаг 2: Чек-лист первичного осмотра (Кузов и Салон)">
          <div className="space-y-6">
            {/* Body Section */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                Кузов автомобиля
              </h4>
              <div className="space-y-2">
                {checklist.filter((i) => i.category === 'body').map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <span className="text-sm font-semibold text-slate-800">{item.name}</span>
                    <div className="flex items-center gap-1">
                      {['ok', 'warning', 'damage'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleChecklistChange(item.id, st)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            item.status === st
                              ? st === 'ok'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : st === 'warning'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-rose-600 text-white shadow-xs'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {st === 'ok' ? 'Норма' : st === 'warning' ? 'Замечание' : 'Дефект'}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interior Section */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                Салон автомобиля
              </h4>
              <div className="space-y-2">
                {checklist.filter((i) => i.category === 'interior').map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <span className="text-sm font-semibold text-slate-800">{item.name}</span>
                    <div className="flex items-center gap-1">
                      {['ok', 'warning', 'damage'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleChecklistChange(item.id, st)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            item.status === st
                              ? st === 'ok'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : st === 'warning'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-rose-600 text-white shadow-xs'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {st === 'ok' ? 'Норма' : st === 'warning' ? 'Замечание' : 'Дефект'}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button variant="outline" size="md" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Назад
              </Button>
              <Button variant="primary" size="lg" onClick={() => setStep(3)}>
                <span>Фото и дефекты (Шаг 3)</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 3: PHOTOS & DAMAGE MARKING (Section 67) */}
      {step === 3 && (
        <Card title="Шаг 3: Фото, видео и отметки повреждений">
          <div className="space-y-6">
            {/* Interactive Car Blueprint Damage Marking Canvas */}
            <DamageMarkingCanvas
              markers={damageMarkers}
              onChange={setDamageMarkers}
            />

            {/* Media capture badges */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Медиафайлы осмотра
              </h5>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-800">4 фотографии кузова</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-sky-600" />
                    <span className="text-xs font-bold text-slate-800">Видео кругового осмотра</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button variant="outline" size="md" onClick={() => setStep(2)}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Назад
              </Button>
              <Button variant="primary" size="lg" onClick={() => setStep(4)}>
                <span>Итог приемки (Шаг 4)</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 4: SUMMARY & WORK ORDER CREATION (Section 1 & 111) */}
      {step === 4 && (
        <Card title="Шаг 4: Подтверждение и создание заказ-наряда">
          <div className="space-y-5">
            <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Автомобиль и клиент</span>
                <span className="font-mono text-xs font-bold bg-indigo-600 text-white px-2 py-0.5 rounded">
                  {selectedVehicle?.license_plate}
                </span>
              </div>
              <p className="text-base font-bold text-slate-900">
                {selectedVehicle?.make} {selectedVehicle?.model} ({selectedVehicle?.year} г.в.)
              </p>
              <p className="text-xs text-slate-600 font-mono">
                VIN: {selectedVehicle?.vin} • Пробег: {mileage.toLocaleString('ru-RU')} км • Топливо: {fuelLevel}%
              </p>
              <p className="text-xs text-slate-700">
                Владелец: <strong>{selectedCustomer?.first_name} {selectedCustomer?.last_name}</strong> ({selectedCustomer?.phone})
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
              <p className="font-bold text-slate-800">Зафиксировано дефектов кузова: <span className="text-rose-600">{damageMarkers.length}</span></p>
              <p className="text-slate-600">Причина обращения: {customerComment}</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Автоматическое формирование заказ-наряда (Section 1 & 111)</p>
                <p className="mt-0.5 text-emerald-800">
                  При сохранении приемки будет автоматически открыт рабочий заказ-наряд, добавлены первичные работы по регламенту ТО и обновлена цифровая история автомобиля.
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button variant="outline" size="md" onClick={() => setStep(3)}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Назад
              </Button>
              <Button
                variant="success"
                size="lg"
                isLoading={isSubmitting}
                onClick={handleFinishInspection}
                className="font-bold shadow-lg shadow-emerald-600/30"
              >
                <Check className="w-5 h-5 mr-1" />
                <span>Завершить приемку и создать заказ</span>
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function NewInspectionPage() {
  return (
    <Suspense fallback={<div className="text-center py-16">Загрузка...</div>}>
      <NewInspectionContent />
    </Suspense>
  );
}
