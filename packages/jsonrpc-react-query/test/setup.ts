import "@testing-library/jest-dom";

const mockTransporter = jest.fn();
jest.mock("@saka-labs/near-jsonrpc-client", () => ({
  createClientWithMethods: jest.fn(),
  jsonRpcTransporter: jest.fn(() => mockTransporter),
  NearRpcEndpoint: {
    Mainnet: "https://rpc.mainnet.near.org",
    Testnet: "https://rpc.testnet.near.org",
  },
}));

const mockQueryResult = {
  data: undefined,
  error: null,
  isLoading: false,
  isFetching: false,
  isSuccess: false,
  isError: false,
  isStale: false,
  refetch: jest.fn(),
  isPending: false,
  isLoadingError: false,
  isRefetchError: false,
  isPlaceholderData: false,
  dataUpdatedAt: 0,
  errorUpdatedAt: 0,
  failureCount: 0,
  failureReason: null,
  fetchStatus: "idle" as const,
  status: "pending" as const,
};

const mockMutationResult = {
  mutate: jest.fn(),
  mutateAsync: jest.fn(),
  isPending: false,
  isSuccess: false,
  isError: false,
  data: undefined,
  error: null,
  reset: jest.fn(),
  variables: undefined,
  isIdle: true,
  status: "idle" as const,
  context: undefined,
  failureCount: 0,
  failureReason: null,
  submittedAt: 0,
};

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(() => mockQueryResult),
  useMutation: jest.fn(() => mockMutationResult),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
    removeQueries: jest.fn(),
  })),
  QueryClient: jest.fn().mockImplementation(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
    removeQueries: jest.fn(),
  })),
}));
