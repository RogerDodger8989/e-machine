; e-Machines — Windows-installer
; Bygg med: ISCC installer\setup.iss   (kör build-installer.mjs först för att
; skapa dist\payload\ som denna skript packar in)

#define MyAppName "e-Machines"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "e-Machines"
#define MyPayloadDir "..\dist\payload"

[Setup]
AppId={{B9C6F6B4-2B7B-4C7A-9C1E-4E3F6D9A1A10}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName=C:\eMachines
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
DisableWelcomePage=no
PrivilegesRequired=admin
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
OutputDir=..\dist
OutputBaseFilename=e-Machines-Setup
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
UninstallDisplayIcon={app}\node-runtime\node.exe

[Languages]
Name: "swedish"; MessagesFile: "compiler:Languages\Swedish.isl"

[Tasks]
Name: "desktopicon"; Description: "Skapa en genväg på skrivbordet"; GroupDescription: "Övrigt:"

[Files]
Source: "{#MyPayloadDir}\*"; DestDir: "{app}"; Flags: recursesubdirs ignoreversion

[Icons]
Name: "{group}\Starta {#MyAppName}"; Filename: "wscript.exe"; Parameters: """{app}\launcher.vbs"""; WorkingDir: "{app}"; IconFilename: "{app}\node-runtime\node.exe"
Name: "{group}\Stoppa {#MyAppName}"; Filename: "wscript.exe"; Parameters: """{app}\stop.vbs"""; WorkingDir: "{app}"
Name: "{group}\Avinstallera {#MyAppName}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "wscript.exe"; Parameters: """{app}\launcher.vbs"""; WorkingDir: "{app}"; IconFilename: "{app}\node-runtime\node.exe"; Tasks: desktopicon

[Run]
; Öppnar porten i brandväggen så surfplattor på samma lokala nätverk kan nå
; servern (t.ex. http://den-här-datorns-ip:3500).
Filename: "netsh"; Parameters: "advfirewall firewall add rule name=""e-Machines"" dir=in action=allow protocol=TCP localport=3500 program=""{app}\node-runtime\node.exe"""; Flags: runhidden
Filename: "wscript.exe"; Parameters: """{app}\launcher.vbs"""; Description: "Starta {#MyAppName} nu"; Flags: postinstall nowait skipifsilent

[UninstallRun]
Filename: "wscript.exe"; Parameters: """{app}\stop.vbs"""; Flags: runhidden
Filename: "netsh"; Parameters: "advfirewall firewall delete rule name=""e-Machines"""; Flags: runhidden

; OBS: data\ (kunddatabasen + backuper) tas INTE bort vid avinstallation,
; eftersom Inno Setup bara rensar filer som installerades av [Files] — inte
; filer som skapats av appen vid körning. Detta är avsiktligt.
