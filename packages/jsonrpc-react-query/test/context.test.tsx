import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { JsonRpcQueryProvider, useJsonRpcQueryConfig } from "../src/context";
import { jsonRpcTransporter, NearRpcEndpoint } from "@saka-labs/jsonrpc-client";
import type { JsonRpcQueryConfig } from "../src/types";

// Test component that uses the hook
function TestComponent() {
  const config = useJsonRpcQueryConfig();
  return (
    <div>
      <span data-testid="has-transporter">
        {typeof config.transporter === "function" ? "yes" : "no"}
      </span>
      <span data-testid="runtime-validation">
        {config.runtimeValidation ? "enabled" : "disabled"}
      </span>
    </div>
  );
}

// Test component that tries to use hook without provider
function TestComponentWithoutProvider() {
  try {
    useJsonRpcQueryConfig();
    return <div data-testid="success">Success</div>;
  } catch (error) {
    return <div data-testid="error">{(error as Error).message}</div>;
  }
}

describe("JsonRpcQueryProvider", () => {
  const mockTransporter = jsonRpcTransporter({
    endpoint: NearRpcEndpoint.Testnet,
  });

  const mockConfig: JsonRpcQueryConfig = {
    transporter: mockTransporter,
    runtimeValidation: true,
  };

  it("provides config to children components", () => {
    render(
      <JsonRpcQueryProvider config={mockConfig}>
        <TestComponent />
      </JsonRpcQueryProvider>
    );

    expect(screen.getByTestId("has-transporter")).toHaveTextContent("yes");
    expect(screen.getByTestId("runtime-validation")).toHaveTextContent(
      "enabled"
    );
  });

  it("provides config with runtime validation disabled", () => {
    const configWithoutValidation: JsonRpcQueryConfig = {
      transporter: mockTransporter,
      runtimeValidation: false,
    };

    render(
      <JsonRpcQueryProvider config={configWithoutValidation}>
        <TestComponent />
      </JsonRpcQueryProvider>
    );

    expect(screen.getByTestId("runtime-validation")).toHaveTextContent(
      "disabled"
    );
  });

  it("renders children correctly", () => {
    render(
      <JsonRpcQueryProvider config={mockConfig}>
        <div data-testid="child">Child content</div>
      </JsonRpcQueryProvider>
    );

    expect(screen.getByTestId("child")).toHaveTextContent("Child content");
  });
});

describe("useJsonRpcQueryConfig", () => {
  it("throws error when used outside of provider", () => {
    // Suppress console.error for this test
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<TestComponentWithoutProvider />);

    expect(screen.getByTestId("error")).toHaveTextContent(
      "useJsonRpcQueryConfig must be used within a JsonRpcQueryProvider. Make sure to wrap your app with <JsonRpcQueryProvider config={...}>."
    );

    consoleSpy.mockRestore();
  });

  it("returns config when used within provider", () => {
    const mockTransporter = jsonRpcTransporter({
      endpoint: NearRpcEndpoint.Mainnet,
    });

    const mockConfig: JsonRpcQueryConfig = {
      transporter: mockTransporter,
      runtimeValidation: false,
    };

    render(
      <JsonRpcQueryProvider config={mockConfig}>
        <TestComponent />
      </JsonRpcQueryProvider>
    );

    expect(screen.getByTestId("has-transporter")).toHaveTextContent("yes");
    expect(screen.getByTestId("runtime-validation")).toHaveTextContent(
      "disabled"
    );
  });
});
