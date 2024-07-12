import {
  Select,
  Flex,
  Table,
  Image,
  Typography,
  Divider,
  TablePaginationConfig,
} from "antd";
import axios from "axios";
import CODEMirror from "@uiw/react-CODEmirror";
import { javascript } from "@CODEmirror/lang-javascript";
import { useEffect, useState } from "react";
import { CODE } from "../constants";

enum ORDER {
  desc = "market_cap_desc",
  asc = "market_cap_asc",
}

enum CURRENCY {
  usd = "usd",
  eur = "eur",
}

interface DataSettings {
  order: ORDER;
  currency: CURRENCY;
  currentPage: number | 1;
  perPage: number | 10;
}

interface Data {
  id: string;
  name: string;
  image: string;
  current_price: number;
  circulating_supply: number;
}

const COLUMNS = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (_: "", { image, name }: { image: string; name: string }) => (
      <Flex gap={16} align="center">
        <Image width={35} src={image} />
        <Typography.Text>{name}</Typography.Text>
      </Flex>
    ),
  },
  {
    title: "Current Price",
    dataIndex: "current_price",
    key: "current_price",
  },
  {
    title: "Circulating Supply",
    dataIndex: "circulating_supply",
    key: "circulating_supply",
  },
];

const API_LINK =
  "https://api.coingecko.com/api/v3/coins/markets?sparkline=false";

const getData = async (dataSettings: DataSettings) => {
  const { currency, order, perPage, currentPage } = dataSettings;

  const link = `${API_LINK}&vs_currency=${currency}&order=${order}&per_page=${perPage}&page=${currentPage}`;

  try {
    const res = await axios.get(link);

    const normalizedData = res.data.map((item: Data) => ({ ...item, key: item.id }));

    return normalizedData;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

const Title = ({ text }: { text: string }) => (
  <Typography.Text style={{ fontSize: "24px" }}>{text}</Typography.Text>
);

export const CurrencyList = () => {
  const [dataSettings, setDataSettings] = useState<DataSettings>({
    order: ORDER.desc,
    currency: CURRENCY.usd,
    perPage: 10,
    currentPage: 1,
  });
  const [currencyData, setCurrencyData] = useState<Data[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleCurrencyChange = (value: CURRENCY) => {
    setDataSettings({
      ...dataSettings,
      currency: value,
    });
  };

  const handleOrderChange = (value: ORDER) => {
    setDataSettings({
      ...dataSettings,
      order: value,
    });
  };

  const handleTableChange = async (pagination: TablePaginationConfig) => {
    const { pageSize, current } = pagination;

    setDataSettings({
      ...dataSettings,
      currentPage: current || 1,
      perPage: pageSize || 1,
    });
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
  
      try {
        const res = await getData(dataSettings);
  
        setCurrencyData(res);
      } catch (error) {
        console.error('Failed to load data:', error);
        setCurrencyData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dataSettings.currency, dataSettings.currentPage, dataSettings.order, dataSettings.perPage, dataSettings]);

  return (
    <Flex vertical gap={24}>
      <Title text="Coins & Market" />

      <Flex gap={24}>
        <Select
          options={[
            { value: CURRENCY.usd, label: <span>USD</span> },
            { value: CURRENCY.eur, label: <span>EUR</span> },
          ]}
          value={dataSettings.currency}
          style={{
            width: 200,
          }}
          onChange={handleCurrencyChange}
        />
        <Select
          options={[
            {
              value: ORDER.desc,
              label: <span>Market cap descending</span>,
            },
            {
              value: ORDER.asc,
              label: <span>Market cap ascending</span>,
            },
          ]}
          value={dataSettings.order}
          style={{
            width: 200,
          }}
          onChange={handleOrderChange}
        />
      </Flex>

      <Table
        dataSource={currencyData}
        columns={COLUMNS}
        pagination={{
          position: ["bottomRight"],
          defaultCurrent: dataSettings.currentPage,
          total: 10000,
        }}
        onChange={handleTableChange}
        loading={isLoading}
      />

      <Divider></Divider>

      <Title text="App Source CODE" />

      <CODEMirror
        value={CODE}
        extensions={[javascript()]}
        theme="light"
        readOnly={true}
        basicSetup={{
          lineNumbers: true,
        }}
      />
    </Flex>
  );
};
