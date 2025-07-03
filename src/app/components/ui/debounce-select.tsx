import React, { useMemo, useRef, useState } from 'react';
import { Select, Spin } from 'antd';
import type { SelectProps } from 'antd';
import debounce from 'lodash/debounce';

export interface DefaultSelectValue {
  key?: string;
  label: React.ReactNode;
  value: string | number;
}

export interface DebounceSelectProps<ValueType = DefaultSelectValue>
  // Meng-Omit 'onChange' dari SelectProps dasar untuk mendefinisikan ulang sesuai kebutuhan kita.
  // Juga meng-Omit 'value', 'options', 'children' karena kita sudah mendefinisikannya secara spesifik.
  extends Omit<SelectProps<ValueType>, 'options' | 'children' | 'value' | 'onChange'> {
  fetchOptions: (search: string) => Promise<ValueType[]>;
  debounceTimeout?: number;
  value?: ValueType; // Properti value secara eksplisit didefinisikan sebagai tipe tunggal ValueType atau undefined
  // Definisi ulang onChange agar menerima ValueType tunggal atau undefined
  onChange?: (value: ValueType | undefined) => void;
}

const DebounceSelect = <
  ValueType extends DefaultSelectValue = DefaultSelectValue,
>({ fetchOptions, debounceTimeout = 300, ...props }: DebounceSelectProps<ValueType>) => {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<ValueType[]>([]);
  const fetchRef = useRef(0);
  const initialFetchPerformed = useRef(false);

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setFetching(true);

      fetchOptions(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          return;
        }

        setOptions(newOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  const handleFocus = () => {
    if (!initialFetchPerformed.current) {
      debounceFetcher(''); // Panggil fetcher dengan string kosong untuk fetch semua data
      initialFetchPerformed.current = true; // Setel menjadi true agar tidak fetch lagi pada fokus berikutnya
    }
  };

  return (
    <Select
      labelInValue
      filterOption={false}
      showSearch
      onSearch={debounceFetcher}
      onFocus={handleFocus}
      notFoundContent={fetching ? <Spin size="small" /> : 'No results found'}
      {...props}
      options={options}
      optionRender={(option) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {option.label}
        </div>
      )}
    />
  );
};

export default DebounceSelect;
