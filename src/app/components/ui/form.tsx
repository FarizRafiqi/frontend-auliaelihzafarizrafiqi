"use client";

import React, { useState, useCallback, useEffect } from 'react';
import type { FormProps } from 'antd';
import { Form as AntdForm } from 'antd';
import DebounceSelect from "@/app/components/ui/debounce-select";
import { useDispatch, useSelector } from 'react-redux';
import { fetchCountries, selectCountries, CountryValue } from '@/store/country-slice';
import { fetchHarbors, selectHarbors, HarborValue } from '@/store/harbor-slice';
import { AppDispatch } from '@/store/store';

type FieldType = {
  country?: string;
  harbor?: string;
  item?: string;
  discount: number;
  price: number;
  total: number;
};

const Form = () => {
  const [countryValue, setCountryValue] = useState<CountryValue[]>([]);
  const [harborValue, setHarborValue] = useState<HarborValue[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const countries = useSelector(selectCountries);
  const harbors = useSelector(selectHarbors);

  const fetchCountryList = useCallback(async (search: string): Promise<CountryValue[]> => {
    await dispatch(fetchCountries({ filter: search }));
    return countries;
  }, [dispatch, countries]);

  const fetchHarborList = useCallback(async (search: string): Promise<HarborValue[]> => {
    await dispatch(fetchHarbors({ filter: search }));
    return harbors;
  }, [dispatch, harbors]);

  useEffect(() => {
    dispatch(fetchCountries({}));
  }, [dispatch]);

  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    console.log('Success:', values);
  };

  return (
    <AntdForm name="form"
              labelCol={{span: 8}}
              wrapperCol={{span: 16}}
              onFinish={onFinish}
              layout="vertical"
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
            console.log(newValue)
            if (Array.isArray(newValue)) {
              setCountryValue(newValue);
            }
          }}
        />
      </AntdForm.Item>

      <AntdForm.Item<FieldType>
        label="Pelabuhan"
        name="harbor"
        rules={[{required: true, message: 'Please input your harbor!'}]}
      >
        <DebounceSelect
          value={harborValue}
          placeholder="Pilih Pelabuhan"
          fetchOptions={fetchHarborList}
          className="w-full"
          onChange={(newValue) => {
            console.log(newValue)
            if (Array.isArray(newValue)) {
              setHarborValue(newValue);
            }
          }}
        />
      </AntdForm.Item>
    </AntdForm>
  )
}
export default Form
