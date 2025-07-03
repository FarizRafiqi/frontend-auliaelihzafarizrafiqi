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
  extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
  fetchOptions: (search: string) => Promise<ValueType[]>;
  debounceTimeout?: number;
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
