/**
 * LVGL Code Generator
 * Generates C and H code from XML component tree
 */

import { XMLParser } from 'fast-xml-parser';
import { getComponentByType } from './components/lvglComponents';

let _componentCounter = 0;

export interface LvglNode {
    id: string;
    type: string;
    name: string;
    properties: Record<string, string | number | boolean>;
    children: LvglNode[];
}

export interface GeneratedCode {
    headerContent: string;
    sourceContent: string;
}

/**
 * Convert property value to LVGL C code format
 */
function propertyToCode(propName: string, value: string | number | boolean): string {
    if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
    }
    if (typeof value === 'string') {
        // Handle color values
        if (propName.includes('color') && value.startsWith('#')) {
            const hex = value.slice(1);
            return `lv_color_hex(0x${hex})`;
        }
        // Handle string escaping - escape backslashes and quotes
        return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    }
    return String(value);
}

/**
 * Convert property name to LVGL style setter
 */
function getStyleSetter(propName: string): string {
    const styleMap: Record<string, string> = {
        'bg_color': 'lv_obj_set_style_bg_color',
        'bg_opa': 'lv_obj_set_style_bg_opa',
        'border_color': 'lv_obj_set_style_border_color',
        'border_width': 'lv_obj_set_style_border_width',
        'radius': 'lv_obj_set_style_radius',
        'text_color': 'lv_obj_set_style_text_color',
        'line_color': 'lv_obj_set_style_line_color',
        'line_width': 'lv_obj_set_style_line_width',
        'pad_top': 'lv_obj_set_style_pad_top',
        'pad_bottom': 'lv_obj_set_style_pad_bottom',
        'pad_left': 'lv_obj_set_style_pad_left',
        'pad_right': 'lv_obj_set_style_pad_right',
        'pad_row': 'lv_obj_set_style_pad_row',
        'pad_column': 'lv_obj_set_style_pad_column',
    };
    return styleMap[propName] || '';
}

/**
 * Generate code for a single component
 */
function generateComponentCode(node: LvglNode, parentVar: string, indent: string, generateComments: boolean): string {
    const componentDef = getComponentByType(node.type);
    if (!componentDef) {
        return `${indent}// Unknown component type: ${node.type}\n`;
    }

    let code = '';
    const varName = node.name || `${node.type.replace('lv_', '')}_${++_componentCounter}`;

    // Add comment if enabled
    if (generateComments) {
        code += `${indent}/* Create ${componentDef.displayName}: ${varName} */\n`;
    }

    // Create the component
    code += `${indent}lv_obj_t *${varName} = ${componentDef.createCode}(${parentVar});\n`;

    // Set position and size
    const x = node.properties['x'] ?? 0;
    const y = node.properties['y'] ?? 0;
    const width = node.properties['width'] ?? 100;
    const height = node.properties['height'] ?? 50;

    code += `${indent}lv_obj_set_pos(${varName}, ${x}, ${y});\n`;
    code += `${indent}lv_obj_set_size(${varName}, ${width}, ${height});\n`;

    // Set component-specific properties
    for (const [propName, value] of Object.entries(node.properties)) {
        // Skip basic positioning properties already handled
        if (['x', 'y', 'width', 'height', 'name'].includes(propName)) {
            continue;
        }

        // Handle style properties
        const styleSetter = getStyleSetter(propName);
        if (styleSetter) {
            if (propName.includes('color')) {
                const colorValue = propertyToCode(propName, value);
                code += `${indent}${styleSetter}(${varName}, ${colorValue}, LV_PART_MAIN);\n`;
            } else {
                code += `${indent}${styleSetter}(${varName}, ${value}, LV_PART_MAIN);\n`;
            }
            continue;
        }

        // Handle component-specific properties
        switch (node.type) {
            case 'lv_label':
                if (propName === 'text') {
                    code += `${indent}lv_label_set_text(${varName}, ${propertyToCode(propName, value)});\n`;
                } else if (propName === 'long_mode') {
                    const modeMap: Record<string, string> = {
                        'wrap': 'LV_LABEL_LONG_WRAP',
                        'dot': 'LV_LABEL_LONG_DOT',
                        'scroll': 'LV_LABEL_LONG_SCROLL',
                        'scroll_circular': 'LV_LABEL_LONG_SCROLL_CIRCULAR',
                        'clip': 'LV_LABEL_LONG_CLIP',
                    };
                    code += `${indent}lv_label_set_long_mode(${varName}, ${modeMap[String(value)] || 'LV_LABEL_LONG_WRAP'});\n`;
                }
                break;

            case 'lv_btn':
                // Button specific properties can be added here
                break;

            case 'lv_arc':
            case 'lv_bar':
            case 'lv_slider':
                if (propName === 'value') {
                    const setterMap: Record<string, string> = {
                        'lv_arc': 'lv_arc_set_value',
                        'lv_bar': 'lv_bar_set_value',
                        'lv_slider': 'lv_slider_set_value',
                    };
                    code += `${indent}${setterMap[node.type]}(${varName}, ${value}, LV_ANIM_OFF);\n`;
                } else if (propName === 'min' || propName === 'max') {
                    // Range is set together, skip individual handling
                }
                break;

            case 'lv_switch':
            case 'lv_checkbox':
                if (propName === 'checked' && value === true) {
                    code += `${indent}lv_obj_add_state(${varName}, LV_STATE_CHECKED);\n`;
                }
                if (propName === 'text' && node.type === 'lv_checkbox') {
                    code += `${indent}lv_checkbox_set_text(${varName}, ${propertyToCode(propName, value)});\n`;
                }
                break;

            case 'lv_dropdown':
            case 'lv_roller':
                if (propName === 'options') {
                    const setter = node.type === 'lv_dropdown' ? 'lv_dropdown_set_options' : 'lv_roller_set_options';
                    const mode = node.type === 'lv_roller' ? ', LV_ROLLER_MODE_NORMAL' : '';
                    code += `${indent}${setter}(${varName}, ${propertyToCode(propName, value)}${mode});\n`;
                } else if (propName === 'selected') {
                    const setter = node.type === 'lv_dropdown' ? 'lv_dropdown_set_selected' : 'lv_roller_set_selected';
                    code += `${indent}${setter}(${varName}, ${value}, LV_ANIM_OFF);\n`;
                }
                break;

            case 'lv_textarea':
                if (propName === 'text') {
                    code += `${indent}lv_textarea_set_text(${varName}, ${propertyToCode(propName, value)});\n`;
                } else if (propName === 'placeholder') {
                    code += `${indent}lv_textarea_set_placeholder_text(${varName}, ${propertyToCode(propName, value)});\n`;
                } else if (propName === 'one_line' && value === true) {
                    code += `${indent}lv_textarea_set_one_line(${varName}, true);\n`;
                } else if (propName === 'password_mode' && value === true) {
                    code += `${indent}lv_textarea_set_password_mode(${varName}, true);\n`;
                }
                break;

            case 'lv_img':
                if (propName === 'src' && value) {
                    code += `${indent}lv_img_set_src(${varName}, &${value});\n`;
                } else if (propName === 'zoom') {
                    code += `${indent}lv_img_set_zoom(${varName}, ${value});\n`;
                } else if (propName === 'angle') {
                    code += `${indent}lv_img_set_angle(${varName}, ${value});\n`;
                }
                break;

            case 'lv_spinner':
                // Spinner is created with time and arc_length in create function
                break;

            default:
                // Handle layout properties
                if (propName === 'layout') {
                    if (value === 'flex') {
                        code += `${indent}lv_obj_set_layout(${varName}, LV_LAYOUT_FLEX);\n`;
                    } else if (value === 'grid') {
                        code += `${indent}lv_obj_set_layout(${varName}, LV_LAYOUT_GRID);\n`;
                    }
                } else if (propName === 'flex_flow') {
                    const flowMap: Record<string, string> = {
                        'row': 'LV_FLEX_FLOW_ROW',
                        'column': 'LV_FLEX_FLOW_COLUMN',
                        'row_wrap': 'LV_FLEX_FLOW_ROW_WRAP',
                        'row_reverse': 'LV_FLEX_FLOW_ROW_REVERSE',
                        'column_reverse': 'LV_FLEX_FLOW_COLUMN_REVERSE',
                        'column_wrap': 'LV_FLEX_FLOW_COLUMN_WRAP',
                    };
                    code += `${indent}lv_obj_set_flex_flow(${varName}, ${flowMap[String(value)] || 'LV_FLEX_FLOW_ROW'});\n`;
                }
                break;
        }
    }

    // Add blank line after component
    code += '\n';

    // Generate code for children
    for (const child of node.children) {
        code += generateComponentCode(child, varName, indent, generateComments);
    }

    return code;
}

/**
 * Generate C and H files from node tree
 */
export function generateCode(rootNodes: LvglNode[], screenName: string, generateComments: boolean): GeneratedCode {
    const upperName = screenName.toUpperCase();
    const lowerName = screenName.toLowerCase();

    _componentCounter = 0;

    // Generate header file
    let headerContent = '';
    if (generateComments) {
        headerContent += `/**\n`;
        headerContent += ` * @file ${lowerName}.h\n`;
        headerContent += ` * @brief ${screenName} screen header\n`;
        headerContent += ` * @note Auto-generated by LVGL Builder\n`;
        headerContent += ` */\n\n`;
    }
    headerContent += `#ifndef ${upperName}_H\n`;
    headerContent += `#define ${upperName}_H\n\n`;
    if (generateComments) {
        headerContent += `/*********************\n`;
        headerContent += ` *      INCLUDES\n`;
        headerContent += ` *********************/\n`;
    }
    headerContent += `#include "lvgl.h"\n\n`;
    if (generateComments) {
        headerContent += `/*********************\n`;
        headerContent += ` *      DEFINES\n`;
        headerContent += ` *********************/\n\n`;
        headerContent += `/**********************\n`;
        headerContent += ` * GLOBAL PROTOTYPES\n`;
        headerContent += ` **********************/\n`;
    }
    headerContent += `void ${lowerName}_create(lv_obj_t *parent);\n\n`;
    headerContent += `#endif /* ${upperName}_H */\n`;

    // Generate source file
    let sourceContent = '';
    if (generateComments) {
        sourceContent += `/**\n`;
        sourceContent += ` * @file ${lowerName}.c\n`;
        sourceContent += ` * @brief ${screenName} screen implementation\n`;
        sourceContent += ` * @note Auto-generated by LVGL Builder\n`;
        sourceContent += ` */\n\n`;
        sourceContent += `/*********************\n`;
        sourceContent += ` *      INCLUDES\n`;
        sourceContent += ` *********************/\n`;
    }
    sourceContent += `#include "${lowerName}.h"\n\n`;
    if (generateComments) {
        sourceContent += `/*********************\n`;
        sourceContent += ` *      DEFINES\n`;
        sourceContent += ` *********************/\n\n`;
        sourceContent += `/**********************\n`;
        sourceContent += ` *  STATIC VARIABLES\n`;
        sourceContent += ` **********************/\n\n`;
        sourceContent += `/**********************\n`;
        sourceContent += ` *  STATIC PROTOTYPES\n`;
        sourceContent += ` **********************/\n\n`;
        sourceContent += `/**********************\n`;
        sourceContent += ` * GLOBAL FUNCTIONS\n`;
        sourceContent += ` **********************/\n\n`;
        sourceContent += `/**\n`;
        sourceContent += ` * Create the ${screenName} screen\n`;
        sourceContent += ` * @param parent pointer to parent object\n`;
        sourceContent += ` */\n`;
    }
    sourceContent += `void ${lowerName}_create(lv_obj_t *parent)\n`;
    sourceContent += `{\n`;

    // Generate component code
    const indent = '    ';
    for (const node of rootNodes) {
        sourceContent += generateComponentCode(node, 'parent', indent, generateComments);
    }

    sourceContent += `}\n`;
    if (generateComments) {
        sourceContent += `\n/**********************\n`;
        sourceContent += ` *  STATIC FUNCTIONS\n`;
        sourceContent += ` **********************/\n`;
    }

    return {
        headerContent,
        sourceContent,
    };
}

/**
 * Parse XML string to LvglNode tree
 */
export function parseXmlToNodes(xmlContent: string): LvglNode[] {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
        allowBooleanAttributes: true,
    });

    try {
        const parsed = parser.parse(xmlContent);
        
        // Handle root element
        const root = parsed.lvgl || parsed;
        if (!root) {
            return [];
        }

        return parseChildren(root);
    } catch {
        return [];
    }
}

function parseChildren(parent: Record<string, unknown>): LvglNode[] {
    const nodes: LvglNode[] = [];

    for (const [key, value] of Object.entries(parent)) {
        // Skip non-component keys
        if (key.startsWith('@') || key === '#text' || key === 'lvgl') {
            continue;
        }

        // Handle array of same type components
        const items = Array.isArray(value) ? value : [value];

        for (const item of items) {
            if (typeof item !== 'object' || item === null) {
                continue;
            }

            const nodeItem = item as Record<string, unknown>;
            const node: LvglNode = {
                id: String(nodeItem['id'] || `${key}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`),
                type: key.startsWith('lv_') ? key : `lv_${key}`,
                name: String(nodeItem['name'] || key),
                properties: {},
                children: [],
            };

            // Extract properties
            for (const [propKey, propValue] of Object.entries(nodeItem)) {
                if (propKey === 'id' || propKey === 'name') {
                    continue;
                }
                if (typeof propValue === 'object' && propValue !== null) {
                    // This is a child component, handle later
                    continue;
                }
                node.properties[propKey] = propValue as string | number | boolean;
            }

            // Parse children recursively
            node.children = parseChildren(nodeItem);

            nodes.push(node);
        }
    }

    return nodes;
}

/**
 * Convert LvglNode tree to XML string
 */
export function nodesToXml(nodes: LvglNode[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<lvgl version="1.0">\n';

    for (const node of nodes) {
        xml += nodeToXml(node, '  ');
    }

    xml += '</lvgl>\n';
    return xml;
}

function nodeToXml(node: LvglNode, indent: string): string {
    const tagName = node.type.replace('lv_', '');
    let xml = `${indent}<${tagName}`;

    // Add id and name as attributes
    xml += ` id="${node.id}" name="${node.name}"`;

    // Add properties as attributes
    for (const [key, value] of Object.entries(node.properties)) {
        if (typeof value === 'string') {
            xml += ` ${key}="${value.replace(/"/g, '&quot;')}"`;
        } else {
            xml += ` ${key}="${value}"`;
        }
    }

    if (node.children.length > 0) {
        xml += '>\n';
        for (const child of node.children) {
            xml += nodeToXml(child, indent + '  ');
        }
        xml += `${indent}</${tagName}>\n`;
    } else {
        xml += '/>\n';
    }

    return xml;
}
