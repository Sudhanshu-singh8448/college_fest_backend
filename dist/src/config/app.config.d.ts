declare const _default: (() => {
    env: string;
    port: number;
    name: string;
    cors: {
        origins: string[];
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    env: string;
    port: number;
    name: string;
    cors: {
        origins: string[];
    };
}>;
export default _default;
