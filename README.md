# LVGL Builder

A VS Code extension for visually building LVGL UI components and generating C/H code from XML.

## Features

- 🎨 **Visual Drag-and-Drop Editor** - Design LVGL UI by dragging components onto a canvas
- 📦 **Built-in LVGL Components** - Support for all official LVGL built-in widgets
- ⚙️ **Property Editor** - Configure component properties through an intuitive interface
- 📐 **Layout Support** - Flex and Grid layout configuration for containers
- 🔧 **Code Generation** - Generate C and H files from your XML design
- 🌐 **Internationalization** - Support for English, Chinese, and Japanese
- 📋 **Custom Components** - Extensible architecture for custom component support

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Tlcsdm LVGL Builder"
4. Click Install

### From VSIX File

1. Download the latest `.vsix` file from [Releases](https://github.com/tlcsdm/vscode-lvgl-builder/releases)
2. Open VS Code
3. Go to Extensions (Ctrl+Shift+X)
4. Click the `...` menu and select "Install from VSIX..."
5. Select the downloaded `.vsix` file

## Usage

### Creating a New LVGL UI

1. Create a new file with the `.lvgl.xml` extension
2. Right-click the file and select "Open with LVGL Builder"
3. Drag components from the palette onto the canvas
4. Configure component properties in the properties panel
5. Click "Generate Code" to create C and H files

### Opening Existing XML Files

1. Right-click any XML file in the Explorer
2. Select "Open with LVGL Builder"

### Generating Code

1. Design your UI using the visual editor
2. Click the "Generate Code" button in the toolbar
3. C and H files will be generated in the same directory as the XML file

## Supported Components

### Basic
- Object (lv_obj)

### Display
- Label (lv_label)
- Image (lv_img)
- Line (lv_line)
- Arc (lv_arc)
- Bar (lv_bar)
- Spinner (lv_spinner)
- Table (lv_table)
- Chart (lv_chart)

### Input
- Button (lv_btn)
- Button Matrix (lv_btnmatrix)
- Slider (lv_slider)
- Switch (lv_switch)
- Checkbox (lv_checkbox)
- Dropdown (lv_dropdown)
- Roller (lv_roller)
- Textarea (lv_textarea)
- Spinbox (lv_spinbox)

### Container
- List (lv_list)
- Tabview (lv_tabview)
- Tileview (lv_tileview)
- Window (lv_win)

### Extra
- Calendar (lv_calendar)
- Keyboard (lv_keyboard)
- Message Box (lv_msgbox)

## XML Format

The extension uses LVGL XML format for storing UI designs:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<lvgl version="1.0">
  <obj id="screen_1" name="main_screen" x="0" y="0" width="480" height="320">
    <label id="title" name="title_label" x="10" y="10" text="Hello LVGL"/>
    <btn id="btn1" name="ok_button" x="10" y="50" width="100" height="40">
      <label id="btn_label" name="btn_text" text="OK"/>
    </btn>
  </obj>
</lvgl>
```

## Configuration

| Setting | Description | Default |
|---------|-------------|---------|
| `tlcsdm.lvglBuilder.defaultLayout` | Default layout mode for containers | `flex` |
| `tlcsdm.lvglBuilder.generateComments` | Generate comments in generated code | `true` |

## Development

### Prerequisites

- Node.js 22.x or later
- npm

### Build

```bash
# Install dependencies
npm install

# Compile
npm run compile

# Watch for changes
npm run watch

# Run tests
npm run test

# Lint
npm run lint

# Package extension
npx @vscode/vsce package
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Credits

- [LVGL](https://lvgl.io/) - Light and Versatile Graphics Library
- [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) - Fast XML parser for Node.js
