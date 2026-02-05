/**
 * LVGL Component Definitions
 * Based on official LVGL built-in widgets
 */

export interface LvglProperty {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'color' | 'select' | 'enum';
    default?: string | number | boolean;
    options?: string[];
    min?: number;
    max?: number;
    category: 'basic' | 'style' | 'layout' | 'event';
}

export interface LvglComponent {
    type: string;
    displayName: string;
    category: 'basic' | 'input' | 'display' | 'container' | 'extra';
    icon: string;
    properties: LvglProperty[];
    canHaveChildren: boolean;
    createCode: string;
}

// Common style properties shared by all components
const commonStyleProperties: LvglProperty[] = [
    { name: 'x', type: 'number', default: 0, category: 'basic' },
    { name: 'y', type: 'number', default: 0, category: 'basic' },
    { name: 'width', type: 'number', default: 100, category: 'basic' },
    { name: 'height', type: 'number', default: 50, category: 'basic' },
    { name: 'bg_color', type: 'color', default: '#ffffff', category: 'style' },
    { name: 'bg_opa', type: 'number', default: 255, min: 0, max: 255, category: 'style' },
    { name: 'border_color', type: 'color', default: '#000000', category: 'style' },
    { name: 'border_width', type: 'number', default: 0, min: 0, category: 'style' },
    { name: 'radius', type: 'number', default: 0, min: 0, category: 'style' },
    { name: 'pad_top', type: 'number', default: 0, category: 'style' },
    { name: 'pad_bottom', type: 'number', default: 0, category: 'style' },
    { name: 'pad_left', type: 'number', default: 0, category: 'style' },
    { name: 'pad_right', type: 'number', default: 0, category: 'style' },
];

// Layout properties for containers
const layoutProperties: LvglProperty[] = [
    { 
        name: 'layout', 
        type: 'select', 
        default: 'none', 
        options: ['none', 'flex', 'grid'],
        category: 'layout' 
    },
    { 
        name: 'flex_flow', 
        type: 'select', 
        default: 'row', 
        options: ['row', 'column', 'row_wrap', 'row_reverse', 'column_reverse', 'column_wrap'],
        category: 'layout' 
    },
    { 
        name: 'flex_main_place', 
        type: 'select', 
        default: 'start', 
        options: ['start', 'end', 'center', 'space_evenly', 'space_around', 'space_between'],
        category: 'layout' 
    },
    { 
        name: 'flex_cross_place', 
        type: 'select', 
        default: 'start', 
        options: ['start', 'end', 'center'],
        category: 'layout' 
    },
    { 
        name: 'flex_track_place', 
        type: 'select', 
        default: 'start', 
        options: ['start', 'end', 'center', 'space_evenly', 'space_around', 'space_between'],
        category: 'layout' 
    },
    { name: 'pad_row', type: 'number', default: 0, min: 0, category: 'layout' },
    { name: 'pad_column', type: 'number', default: 0, min: 0, category: 'layout' },
];

/**
 * LVGL Built-in Components
 */
export const lvglComponents: LvglComponent[] = [
    // Basic Object
    {
        type: 'lv_obj',
        displayName: 'Object',
        category: 'basic',
        icon: '□',
        properties: [
            { name: 'name', type: 'string', default: 'obj', category: 'basic' },
            ...commonStyleProperties,
            ...layoutProperties,
        ],
        canHaveChildren: true,
        createCode: 'lv_obj_create'
    },
    
    // Label
    {
        type: 'lv_label',
        displayName: 'Label',
        category: 'display',
        icon: 'Aa',
        properties: [
            { name: 'name', type: 'string', default: 'label', category: 'basic' },
            { name: 'text', type: 'string', default: 'Label', category: 'basic' },
            { name: 'long_mode', type: 'select', default: 'wrap', options: ['wrap', 'dot', 'scroll', 'scroll_circular', 'clip'], category: 'basic' },
            { name: 'text_color', type: 'color', default: '#000000', category: 'style' },
            ...commonStyleProperties,
        ],
        canHaveChildren: false,
        createCode: 'lv_label_create'
    },
    
    // Button
    {
        type: 'lv_btn',
        displayName: 'Button',
        category: 'input',
        icon: '▢',
        properties: [
            { name: 'name', type: 'string', default: 'btn', category: 'basic' },
            ...commonStyleProperties,
            ...layoutProperties,
        ],
        canHaveChildren: true,
        createCode: 'lv_btn_create'
    },
    
    // Button Matrix
    {
        type: 'lv_btnmatrix',
        displayName: 'Button Matrix',
        category: 'input',
        icon: '▦',
        properties: [
            { name: 'name', type: 'string', default: 'btnmatrix', category: 'basic' },
            { name: 'map', type: 'string', default: 'Btn1\\nBtn2\\nBtn3\\n', category: 'basic' },
            { name: 'one_checked', type: 'boolean', default: false, category: 'basic' },
            ...commonStyleProperties,
        ],
        canHaveChildren: false,
        createCode: 'lv_btnmatrix_create'
    },
    
    // Image
    {
        type: 'lv_img',
        displayName: 'Image',
        category: 'display',
        icon: '🖼',
        properties: [
            { name: 'name', type: 'string', default: 'img', category: 'basic' },
            { name: 'src', type: 'string', default: '', category: 'basic' },
            { name: 'zoom', type: 'number', default: 256, min: 0, category: 'style' },
            { name: 'angle', type: 'number', default: 0, min: 0, max: 3600, category: 'style' },
            ...commonStyleProperties,
        ],
        canHaveChildren: false,
        createCode: 'lv_img_create'
    },
    
    // Line
    {
        type: 'lv_line',
        displayName: 'Line',
        category: 'display',
        icon: '─',
        properties: [
            { name: 'name', type: 'string', default: 'line', category: 'basic' },
            { name: 'line_color', type: 'color', default: '#000000', category: 'style' },
            { name: 'line_width', type: 'number', default: 1, min: 1, category: 'style' },
            ...commonStyleProperties,
        ],
        canHaveChildren: false,
        createCode: 'lv_line_create'
    },
    
    // Arc
    {
        type: 'lv_arc',
        displayName: 'Arc',
        category: 'display',
        icon: '◠',
        properties: [
            { name: 'name', type: 'string', default: 'arc', category: 'basic' },
            { name: 'start_angle', type: 'number', default: 135, min: 0, max: 360, category: 'basic' },
            { name: 'end_angle', type: 'number', default: 45, min: 0, max: 360, category: 'basic' },
            { name: 'bg_start_angle', type: 'number', default: 135, min: 0, max: 360, category: 'basic' },
            { name: 'bg_end_angle', type: 'number', default: 45, min: 0, max: 360, category: 'basic' },
            { name: 'value', type: 'number', default: 0, category: 'basic' },
            { name: 'min', type: 'number', default: 0, category: 'basic' },
            { name: 'max', type: 'number', default: 100, category: 'basic' },
            { name: 'mode', type: 'select', default: 'normal', options: ['normal', 'symmetrical', 'reverse'], category: 'basic' },
            ...commonStyleProperties,
        ],
        canHaveChildren: false,
        createCode: 'lv_arc_create'
    },
    
    // Bar
    {
        type: 'lv_bar',
        displayName: 'Bar',
        category: 'display',
        icon: '▬',
        properties: [
            { name: 'name', type: 'string', default: 'bar', category: 'basic' },
            { name: 'value', type: 'number', default: 0, category: 'basic' },
            { name: 'min', type: 'number', default: 0, category: 'basic' },
            { name: 'max', type: 'number', default: 100, category: 'basic' },
            { name: 'mode', type: 'select', default: 'normal', options: ['normal', 'symmetrical', 'range'], category: 'basic' },
            ...commonStyleProperties,
        ],
        canHaveChildren: false,
        createCode: 'lv_bar_create'
    },
    
    // Slider
    {
        type: 'lv_slider',
        displayName: 'Slider',
        category: 'input',
        icon: '━○',
        properties: [
            { name: 'name', type: 'string', default: 'slider', category: 'basic' },
            { name: 'value', type: 'number', default: 0, category: 'basic' },
            { name: 'min', type: 'number', default: 0, category: 'basic' },
            { name: 'max', type: 'number', default: 100, category: 'basic' },
            { name: 'mode', type: 'select', default: 'normal', options: ['normal', 'symmetrical', 'range'], category: 'basic' },
            ...commonStyleProperties,
        ],
        canHaveChildren: false,
        createCode: 'lv_slider_create'
    },
    
    // Switch
    {
        type: 'lv_switch',
        displayName: 'Switch',
        category: 'input',
        icon: '◉',
        properties: [
            { name: 'name', type: 'string', default: 'sw', category: 'basic' },
            { name: 'checked', type: 'boolean', default: false, category: 'basic' },
            ...commonStyleProperties,
        ],
        canHaveChildren: false,
        createCode: 'lv_switch_create'
    },
    
    // Checkbox
    {
        type: 'lv_checkbox',
        displayName: 'Checkbox',
        category: 'input',
        icon: '☑',
        properties: [
            { name: 'name', type: 'string', default: 'cb', category: 'basic' },
            { name: 'text', type: 'string', default: 'Checkbox', category: 'basic' },
            { name: 'checked', type: 'boolean', default: false, category: 'basic' },
            ...commonStyleProperties,
        ],
        canHaveChildren: false,
        createCode: 'lv_checkbox_create'
    },
    
    // Dropdown
    {
        type: 'lv_dropdown',
        displayName: 'Dropdown',
        category: 'input',
        icon: '▼',
        properties: [
            { name: 'name', type: 'string', default: 'dropdown', category: 'basic' },
            { name: 'options', type: 'string', default: 'Option 1\\nOption 2\\nOption 3', category: 'basic' },
            { name: 'selected', type: 'number', default: 0, min: 0, category: 'basic' },
            { name: 'dir', type: 'select', default: 'bottom', options: ['bottom', 'top', 'left', 'right'], category: 'basic' },
            ...commonStyleProperties,
        ],
        canHaveChildren: false,
        createCode: 'lv_dropdown_create'
    },
    
    // Roller
    {
        type: 'lv_roller',
        displayName: 'Roller',
        category: 'input',
        icon: '⟳',
        properties: [
            { name: 'name', type: 'string', default: 'roller', category: 'basic' },
            { name: 'options', type: 'string', default: 'Option 1\\nOption 2\\nOption 3', category: 'basic' },
            { name: 'selected', type: 'number', default: 0, min: 0, category: 'basic' },
            { name: 'visible_row_count', type: 'number', default: 3, min: 1, category: 'basic' },
            { name: 'mode', type: 'select', default: 'normal', options: ['normal', 'infinite'], category: 'basic' },
            ...commonStyleProperties,
        ],
        canHaveChildren: false,
        createCode: 'lv_roller_create'
    },
    
    // Textarea
    {
        type: 'lv_textarea',
        displayName: 'Textarea',
        category: 'input',
        icon: '📝',
        properties: [
            { name: 'name', type: 'string', default: 'ta', category: 'basic' },
            { name: 'text', type: 'string', default: '', category: 'basic' },
            { name: 'placeholder', type: 'string', default: 'Type here...', category: 'basic' },
            { name: 'one_line', type: 'boolean', default: false, category: 'basic' },
            { name: 'password_mode', type: 'boolean', default: false, category: 'basic' },
            { name: 'max_length', type: 'number', default: 0, min: 0, category: 'basic' },
            ...commonStyleProperties,
        ],
        canHaveChildren: false,
        createCode: 'lv_textarea_create'
    },
    
    // Table
    {
        type: 'lv_table',
        displayName: 'Table',
        category: 'display',
        icon: '▦',
        properties: [
            { name: 'name', type: 'string', default: 'table', category: 'basic' },
            { name: 'row_count', type: 'number', default: 2, min: 1, category: 'basic' },
            { name: 'col_count', type: 'number', default: 2, min: 1, category: 'basic' },
            ...commonStyleProperties,
        ],
        canHaveChildren: false,
        createCode: 'lv_table_create'
    },
    
    // Chart
    {
        type: 'lv_chart',
        displayName: 'Chart',
        category: 'display',
        icon: '📊',
        properties: [
            { name: 'name', type: 'string', default: 'chart', category: 'basic' },
            { name: 'type', type: 'select', default: 'line', options: ['line', 'bar', 'scatter'], category: 'basic' },
            { name: 'point_count', type: 'number', default: 10, min: 1, category: 'basic' },
            { name: 'range_min', type: 'number', default: 0, category: 'basic' },
            { name: 'range_max', type: 'number', default: 100, category: 'basic' },
            ...commonStyleProperties,
        ],
        canHaveChildren: false,
        createCode: 'lv_chart_create'
    },
    
    // Calendar
    {
        type: 'lv_calendar',
        displayName: 'Calendar',
        category: 'extra',
        icon: '📅',
        properties: [
            { name: 'name', type: 'string', default: 'calendar', category: 'basic' },
            { name: 'today_year', type: 'number', default: new Date().getFullYear(), category: 'basic' },
            { name: 'today_month', type: 'number', default: 1, min: 1, max: 12, category: 'basic' },
            { name: 'today_day', type: 'number', default: 1, min: 1, max: 31, category: 'basic' },
            ...commonStyleProperties,
        ],
        canHaveChildren: false,
        createCode: 'lv_calendar_create'
    },
    
    // Keyboard
    {
        type: 'lv_keyboard',
        displayName: 'Keyboard',
        category: 'extra',
        icon: '⌨',
        properties: [
            { name: 'name', type: 'string', default: 'kb', category: 'basic' },
            { name: 'mode', type: 'select', default: 'text_lower', options: ['text_lower', 'text_upper', 'special', 'number'], category: 'basic' },
            ...commonStyleProperties,
        ],
        canHaveChildren: false,
        createCode: 'lv_keyboard_create'
    },
    
    // List
    {
        type: 'lv_list',
        displayName: 'List',
        category: 'container',
        icon: '≡',
        properties: [
            { name: 'name', type: 'string', default: 'list', category: 'basic' },
            ...commonStyleProperties,
            ...layoutProperties,
        ],
        canHaveChildren: true,
        createCode: 'lv_list_create'
    },
    
    // Message Box
    {
        type: 'lv_msgbox',
        displayName: 'Message Box',
        category: 'extra',
        icon: '💬',
        properties: [
            { name: 'name', type: 'string', default: 'msgbox', category: 'basic' },
            { name: 'title', type: 'string', default: 'Title', category: 'basic' },
            { name: 'text', type: 'string', default: 'Message content', category: 'basic' },
            { name: 'close_button', type: 'boolean', default: true, category: 'basic' },
            ...commonStyleProperties,
        ],
        canHaveChildren: false,
        createCode: 'lv_msgbox_create'
    },
    
    // Spinbox
    {
        type: 'lv_spinbox',
        displayName: 'Spinbox',
        category: 'input',
        icon: '⧆',
        properties: [
            { name: 'name', type: 'string', default: 'spinbox', category: 'basic' },
            { name: 'value', type: 'number', default: 0, category: 'basic' },
            { name: 'min', type: 'number', default: -9999, category: 'basic' },
            { name: 'max', type: 'number', default: 9999, category: 'basic' },
            { name: 'step', type: 'number', default: 1, min: 1, category: 'basic' },
            { name: 'digit_count', type: 'number', default: 5, min: 1, max: 10, category: 'basic' },
            { name: 'separator_position', type: 'number', default: 0, min: 0, category: 'basic' },
            ...commonStyleProperties,
        ],
        canHaveChildren: false,
        createCode: 'lv_spinbox_create'
    },
    
    // Spinner
    {
        type: 'lv_spinner',
        displayName: 'Spinner',
        category: 'display',
        icon: '↻',
        properties: [
            { name: 'name', type: 'string', default: 'spinner', category: 'basic' },
            { name: 'time', type: 'number', default: 1000, min: 100, category: 'basic' },
            { name: 'arc_length', type: 'number', default: 60, min: 1, max: 360, category: 'basic' },
            ...commonStyleProperties,
        ],
        canHaveChildren: false,
        createCode: 'lv_spinner_create'
    },
    
    // Tabview
    {
        type: 'lv_tabview',
        displayName: 'Tabview',
        category: 'container',
        icon: '⊞',
        properties: [
            { name: 'name', type: 'string', default: 'tabview', category: 'basic' },
            { name: 'tab_pos', type: 'select', default: 'top', options: ['top', 'bottom', 'left', 'right'], category: 'basic' },
            { name: 'tab_size', type: 'number', default: 40, min: 20, category: 'basic' },
            ...commonStyleProperties,
        ],
        canHaveChildren: true,
        createCode: 'lv_tabview_create'
    },
    
    // Tileview
    {
        type: 'lv_tileview',
        displayName: 'Tileview',
        category: 'container',
        icon: '⊡',
        properties: [
            { name: 'name', type: 'string', default: 'tileview', category: 'basic' },
            ...commonStyleProperties,
        ],
        canHaveChildren: true,
        createCode: 'lv_tileview_create'
    },
    
    // Window
    {
        type: 'lv_win',
        displayName: 'Window',
        category: 'container',
        icon: '⧉',
        properties: [
            { name: 'name', type: 'string', default: 'win', category: 'basic' },
            { name: 'title', type: 'string', default: 'Window', category: 'basic' },
            { name: 'header_height', type: 'number', default: 40, min: 20, category: 'basic' },
            ...commonStyleProperties,
        ],
        canHaveChildren: true,
        createCode: 'lv_win_create'
    },
    
    // Animation Image
    {
        type: 'lv_animimg',
        displayName: 'Animation Image',
        category: 'display',
        icon: '🎞',
        properties: [
            { name: 'name', type: 'string', default: 'animimg', category: 'basic' },
            { name: 'duration', type: 'number', default: 1000, min: 100, category: 'basic' },
            { name: 'repeat_count', type: 'number', default: -1, category: 'basic' },
            ...commonStyleProperties,
        ],
        canHaveChildren: false,
        createCode: 'lv_animimg_create'
    },
    
    // Canvas
    {
        type: 'lv_canvas',
        displayName: 'Canvas',
        category: 'display',
        icon: '🖌',
        properties: [
            { name: 'name', type: 'string', default: 'canvas', category: 'basic' },
            ...commonStyleProperties,
        ],
        canHaveChildren: false,
        createCode: 'lv_canvas_create'
    },
    
    // Image Button
    {
        type: 'lv_imgbtn',
        displayName: 'Image Button',
        category: 'input',
        icon: '🖼',
        properties: [
            { name: 'name', type: 'string', default: 'imgbtn', category: 'basic' },
            { name: 'src_left', type: 'string', default: '', category: 'basic' },
            { name: 'src_mid', type: 'string', default: '', category: 'basic' },
            { name: 'src_right', type: 'string', default: '', category: 'basic' },
            ...commonStyleProperties,
        ],
        canHaveChildren: false,
        createCode: 'lv_imgbtn_create'
    },
    
    // LED
    {
        type: 'lv_led',
        displayName: 'LED',
        category: 'display',
        icon: '💡',
        properties: [
            { name: 'name', type: 'string', default: 'led', category: 'basic' },
            { name: 'brightness', type: 'number', default: 255, min: 0, max: 255, category: 'basic' },
            { name: 'color', type: 'color', default: '#00ff00', category: 'style' },
            ...commonStyleProperties,
        ],
        canHaveChildren: false,
        createCode: 'lv_led_create'
    },
    
    // Menu
    {
        type: 'lv_menu',
        displayName: 'Menu',
        category: 'container',
        icon: '☰',
        properties: [
            { name: 'name', type: 'string', default: 'menu', category: 'basic' },
            { name: 'mode_header', type: 'select', default: 'top_fixed', options: ['top_fixed', 'top_static', 'bottom_fixed'], category: 'basic' },
            { name: 'mode_root_back_btn', type: 'select', default: 'enabled', options: ['enabled', 'disabled'], category: 'basic' },
            ...commonStyleProperties,
            ...layoutProperties,
        ],
        canHaveChildren: true,
        createCode: 'lv_menu_create'
    },
    
    // Scale (v9+)
    {
        type: 'lv_scale',
        displayName: 'Scale',
        category: 'display',
        icon: '📏',
        properties: [
            { name: 'name', type: 'string', default: 'scale', category: 'basic' },
            { name: 'mode', type: 'select', default: 'horizontal_bottom', options: ['horizontal_top', 'horizontal_bottom', 'vertical_left', 'vertical_right', 'round_inner', 'round_outer'], category: 'basic' },
            { name: 'total_tick_count', type: 'number', default: 11, min: 2, category: 'basic' },
            { name: 'major_tick_every', type: 'number', default: 5, min: 1, category: 'basic' },
            { name: 'range_min', type: 'number', default: 0, category: 'basic' },
            { name: 'range_max', type: 'number', default: 100, category: 'basic' },
            ...commonStyleProperties,
        ],
        canHaveChildren: false,
        createCode: 'lv_scale_create'
    },
    
    // Span Group
    {
        type: 'lv_spangroup',
        displayName: 'Span Group',
        category: 'display',
        icon: '📄',
        properties: [
            { name: 'name', type: 'string', default: 'spangroup', category: 'basic' },
            { name: 'align', type: 'select', default: 'left', options: ['left', 'center', 'right'], category: 'basic' },
            { name: 'overflow', type: 'select', default: 'clip', options: ['clip', 'ellipsis'], category: 'basic' },
            { name: 'indent', type: 'number', default: 0, min: 0, category: 'basic' },
            { name: 'mode', type: 'select', default: 'expand', options: ['expand', 'break', 'fixed'], category: 'basic' },
            ...commonStyleProperties,
        ],
        canHaveChildren: false,
        createCode: 'lv_spangroup_create'
    },
    
    // Color Wheel (lv_colorwheel)
    {
        type: 'lv_colorwheel',
        displayName: 'Color Wheel',
        category: 'input',
        icon: '🎨',
        properties: [
            { name: 'name', type: 'string', default: 'colorwheel', category: 'basic' },
            { name: 'mode', type: 'select', default: 'hue', options: ['hue', 'saturation', 'value'], category: 'basic' },
            { name: 'mode_fixed', type: 'boolean', default: false, category: 'basic' },
            ...commonStyleProperties,
        ],
        canHaveChildren: false,
        createCode: 'lv_colorwheel_create'
    },
    
    // Meter (lv_meter) - gauge replacement
    {
        type: 'lv_meter',
        displayName: 'Meter',
        category: 'display',
        icon: '⏱',
        properties: [
            { name: 'name', type: 'string', default: 'meter', category: 'basic' },
            ...commonStyleProperties,
        ],
        canHaveChildren: false,
        createCode: 'lv_meter_create'
    },
];

/**
 * Get component definition by type
 */
export function getComponentByType(type: string): LvglComponent | undefined {
    return lvglComponents.find(c => c.type === type);
}

/**
 * Get components by category
 */
export function getComponentsByCategory(category: string): LvglComponent[] {
    return lvglComponents.filter(c => c.category === category);
}

/**
 * Get all component categories
 */
export function getCategories(): string[] {
    return [...new Set(lvglComponents.map(c => c.category))];
}
