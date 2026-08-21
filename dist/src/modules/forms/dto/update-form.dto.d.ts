export declare class FormFieldValidationDto {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
    allowed_types?: string[];
    max_size_mb?: number;
}
export declare class FormFieldDto {
    name: string;
    label: string;
    type: string;
    validation?: FormFieldValidationDto;
}
export declare class UpdateFormDto {
    schema: FormFieldDto[];
    isActive?: boolean;
}
