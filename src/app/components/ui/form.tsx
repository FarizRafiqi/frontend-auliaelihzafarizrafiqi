"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { FormProps, InputNumber } from 'antd';
import { Form as AntdForm } from 'antd';
import DebounceSelect from "@/app/components/ui/debounce-select";
import { useDispatch, useSelector } from 'react-redux';
import { fetchCountries, selectCountries, CountryValue } from '@/store/country-slice';
import { fetchHarbors, clearHarbors, HarborValue } from '@/store/harbor-slice';
import { fetchItems, selectItems, clearItems, ItemValue } from '@/store/item-slice';
import { AppDispatch } from '@/store/store';
import TextArea from "antd/es/input/TextArea";

type FieldType = {
  country?: string;
  harbor?: string;
  item?: string;
  discount: number;
  description: string;
  price: number;
  total: number;
};

const Form = () => {
  const [form] = AntdForm.useForm();
  const [countryValue, setCountryValue] = useState<CountryValue | undefined>();
  const [harborValue, setHarborValue] = useState<HarborValue | undefined>();
  const [itemValue, setItemValue] = useState<ItemValue | undefined>();
  const dispatch = useDispatch<AppDispatch>();
  const countries = useSelector(selectCountries);
  const items = useSelector(selectItems);

  const fetchCountryList = useCallback(async (search: string): Promise<CountryValue[]> => {
    const actionResult = await dispatch(fetchCountries({ filter: search }));
    if (fetchCountries.fulfilled.match(actionResult)) {
      return actionResult.payload;
    }
    return [];
  }, [dispatch, countries]);

  const fetchHarborList = useCallback(async (search: string): Promise<HarborValue[]> => {
    const currentCountryId = countryValue?.value;
    const actionResult = await dispatch(fetchHarbors({ filter: search, countryId: currentCountryId }));
    // Jika thunk berhasil, payload akan berisi pelabuhan yang diambil
    if (fetchHarbors.fulfilled.match(actionResult)) {
      return actionResult.payload;
    }
    return [];
  }, [countryValue?.value, dispatch]);

  const fetchItemList = useCallback(async (search: string): Promise<ItemValue[]> => {
    const currentHarborId = harborValue?.value;
    const actionResult = await dispatch(fetchItems({ filter: search, harborId: currentHarborId }));
    // Jika thunk berhasil, payload akan berisi pelabuhan yang diambil
    if (fetchItems.fulfilled.match(actionResult)) {
      return actionResult.payload;
    }
    return [];
  }, [dispatch, harborValue?.value]);

  const recalcTotal = () => {
    const price = form.getFieldValue('price') ?? 0;
    const discount = form.getFieldValue('discount') ?? 0;
    form.setFieldsValue({
      total: price - (price * discount) / 100,
    });
  };

  useEffect(() => {
    dispatch(fetchCountries({}));
    dispatch(fetchHarbors({}));
    dispatch(fetchItems({}));
  }, [dispatch]);

  useEffect(() => {
    if (countryValue) {
      // Bersihkan pilihan pelabuhan saat ini dan data pelabuhan yang diambil
      setHarborValue(undefined);
      form.setFieldsValue({ harbor: undefined });
      dispatch(clearHarbors());

      // Ambil pelabuhan untuk negara yang baru dipilih
      // Panggil fetchHarborList dengan string kosong untuk filter pencarian awal
      fetchHarborList('').then(r => console.log('Harbors fetched:', r));
    } else {
      // Jika tidak ada negara yang dipilih (misal, pilihan negara dihapus),
      // bersihkan juga pelabuhan yang terpilih dan daftar pelabuhan
      setHarborValue(undefined);
      form.setFieldsValue({ harbor: undefined });
      dispatch(clearHarbors());
    }
  }, [countryValue, dispatch, fetchHarborList, form]);

  useEffect(() => {
    setItemValue(undefined);
    form.setFieldsValue({ item: undefined });
    dispatch(clearItems());

    if (harborValue) {
      fetchItemList('');
    }
  }, [harborValue]);

  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    console.log('Success:', values);
  };

  return (
    <AntdForm form={form}
              name="form"
              labelCol={{span: 8}}
              wrapperCol={{span: 16}}
              onFinish={onFinish}
              initialValues={{
                discount: 0,
                price: 0,
                total: 0,
              }}
    >
      <AntdForm.Item<FieldType>
        label="Negara"
        name="country"
        rules={[{required: true, message: 'Please input your country!'}]}
      >
        <DebounceSelect
          value={countryValue}
          placeholder="Pilih Negara"
          fetchOptions={fetchCountryList}
          className="w-full"
          onChange={(newValue) => {
            setCountryValue(newValue);
          }}
        />
      </AntdForm.Item>

      <AntdForm.Item<FieldType>
        label="Pelabuhan"
        name="harbor"
        rules={[{required: true, message: 'Please input your harbor!'}]}
      >
        <DebounceSelect
          key={countryValue?.value || 'no-country'}
          value={harborValue}
          placeholder="Pilih Pelabuhan"
          fetchOptions={fetchHarborList}
          className="w-full"
          onChange={(newValue) => {
            setHarborValue(newValue);
          }}
        />
      </AntdForm.Item>
      <AntdForm.Item<FieldType>
        label="Barang"
        name="item"
        rules={[{required: true, message: 'Please input your item!'}]}
      >
        <DebounceSelect
          key={harborValue?.value || 'no-harbor'}
          value={itemValue}
          placeholder="Pilih Barang"
          fetchOptions={fetchItemList}
          className="w-full"
          onChange={(newValue) => {
            setItemValue(newValue);

            // Cari detail barang yang baru dipilih
            const item = items.find(i => i.value === newValue?.value);
            if (!item) return;

            // Hitung total: harga ‑ (harga * diskon%)
            const total = item.price - (item.price * item.discount) / 100;

            form.setFieldsValue({
              description: newValue?.title,
              discount: item.discount,
              price: item.price,
              total,
            });
          }}
        />
      </AntdForm.Item>
      <AntdForm.Item<FieldType>
        label={<></>}
        name="description"
      >
        <TextArea
          disabled
          className="w-full"
          rows={4}
          maxLength={6}
          style={{ resize: 'none' }}
        />
      </AntdForm.Item>
      <AntdForm.Item<FieldType>
        label="Diskon"
        name="discount"
        rules={[{required: true, message: 'Please input your discount!'}]}
      >
        <InputNumber style={{ width: '100%' }} suffix="%" min={0} onChange={recalcTotal}/>
      </AntdForm.Item>
      <AntdForm.Item
        label="Harga"
        name="price"
        rules={[{required: true, message: 'Please input your price!'}]}
      >
        <InputNumber<number>
          style={{ width: '100%' }}
          prefix="Rp"
          min={0}
          onChange={recalcTotal}
          formatter={(value) =>
            value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''
          }
          parser={(value) =>
            value ? Number(value.replace(/\./g, '')) : 0
          }
        />
      </AntdForm.Item>
      <AntdForm.Item
        label="Total"
        name="total"
        rules={[{required: true, message: 'Please input your total!'}]}
      >
        <InputNumber<number>
          style={{ width: '100%' }}
          prefix="Rp"
          min={0}
          formatter={(value) =>
            value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''
          }
          parser={(value) =>
            value ? Number(value.replace(/\./g, '')) : 0
          }
        />
      </AntdForm.Item>
    </AntdForm>
  )
}

export default Form