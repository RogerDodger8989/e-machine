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

; OBS: data\ (kunddatabasen + backuper) och run\ skapas av appen vid körning,
; inte av [Files] — Inno Setups vanliga avinstallation rör dem aldrig
; automatiskt. run\ (bara en pid-fil) städas alltid bort tyst nedan, men
; data\ raderas bara om användaren uttryckligen svarar Ja på frågan i
; CurUninstallStepChanged — annars sparas kundregistret och backuperna kvar.

[Code]
procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var
  DataDir, RunDir: String;
begin
  if CurUninstallStep = usPostUninstall then
  begin
    DataDir := ExpandConstant('{app}') + '\data';
    RunDir := ExpandConstant('{app}') + '\run';

    if DirExists(DataDir) then
    begin
      if SuppressibleMsgBox(
        'Vill du även ta bort kundregistret och alla backuper (mappen "data")?' + #13#10 + #13#10 +
        'Detta raderar all kunddata permanent och går INTE att ångra. Svara Nej om du vill spara ' +
        'datan (t.ex. inför en ominstallation) eller ta en egen säkerhetskopia av mappen först.',
        mbConfirmation, MB_YESNO, IDNO) = IDYES then
      begin
        DelTree(DataDir, True, True, True);
      end;
    end;

    if DirExists(RunDir) then
      DelTree(RunDir, True, True, True);
  end;
end;
