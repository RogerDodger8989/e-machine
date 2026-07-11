Option Explicit

' Startar e-Machines: kör väntande databasmigreringar (om några), startar
' servern dolt/frikopplat i bakgrunden om den inte redan kör, väntar tills den
' svarar, och öppnar sedan systemets standardwebbläsare. Ingen bakgrundstjänst
' registreras med Windows — appen kör bara medan denna process (och den
' frikopplade servern den startar) lever, vilket matchar valet att inte
' installera e-Machines som en Windows-tjänst.

Dim fso, shell, wmiSvc
Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")
Set wmiSvc = GetObject("winmgmts:\\.\root\cimv2")

Dim installDir, dataDir, runDir, nodeExe, serverJs, migrateScript, pidFile, port, dbUrl, configEnvFile

installDir = fso.GetParentFolderName(WScript.ScriptFullName)
dataDir = installDir & "\data"
runDir = installDir & "\run"
nodeExe = installDir & "\node-runtime\node.exe"
serverJs = installDir & "\app\server.js"
migrateScript = installDir & "\app\deploy\migrate.cjs"
pidFile = runDir & "\server.pid"
configEnvFile = installDir & "\config.env"
port = "3500"
dbUrl = "file:" & dataDir & "\e-machines.db"

If Not fso.FolderExists(dataDir) Then fso.CreateFolder(dataDir)
If Not fso.FolderExists(runDir) Then fso.CreateFolder(runDir)

' config.env innehåller butiksspecifika inställningar (COMPANY_NAME,
' 46elks/SendGrid-nycklar) ifyllda vid installation — läses in explicit här
' istället för att förlita sig på Next.js egen (mindre förutsägbara) .env-
' inläsning i standalone-läge.
ApplyConfigEnvFile configEnvFile

shell.Environment("PROCESS")("DATABASE_URL") = dbUrl
shell.Environment("PROCESS")("PORT") = port
shell.Environment("PROCESS")("HOSTNAME") = "0.0.0.0"

If Not IsServerRunning(pidFile) Then
  ' Kör väntande migreringar (blockerande, dolt fönster). Idempotent —
  ' ofarligt att köra vid varje start.
  shell.Run """" & nodeExe & """ """ & migrateScript & """", 0, True

  StartServerHidden nodeExe, serverJs, installDir, pidFile
  If Not WaitForServer("http://127.0.0.1:" & port & "/", 30) Then
    MsgBox "e-Machines-servern svarade inte inom 30 sekunder på port " & port & _
      ". Kontrollera att porten inte redan används av ett annat program."
    WScript.Quit 1
  End If
End If

shell.Run "http://localhost:" & port & "/", 1, False

' --- Hjälpfunktioner ---------------------------------------------------------

Sub ApplyConfigEnvFile(filePath)
  If Not fso.FileExists(filePath) Then Exit Sub

  Dim f, line, eqPos, key, value
  Set f = fso.OpenTextFile(filePath, 1)
  Do Until f.AtEndOfStream
    line = Trim(f.ReadLine())
    If Len(line) > 0 And Left(line, 1) <> "#" Then
      eqPos = InStr(line, "=")
      If eqPos > 0 Then
        key = Trim(Left(line, eqPos - 1))
        value = Trim(Mid(line, eqPos + 1))
        If Len(key) > 0 Then shell.Environment("PROCESS")(key) = value
      End If
    End If
  Loop
  f.Close
End Sub

Function CurrentEnvironmentArray()
  Dim env, arr(), i, v
  Set env = shell.Environment("PROCESS")
  ReDim arr(env.Count - 1)
  i = 0
  For Each v In env
    arr(i) = v ' WshEnvironment ger redan strängar i formatet NAME=VALUE
    i = i + 1
  Next
  CurrentEnvironmentArray = arr
End Function

Function IsServerRunning(pidFile)
  IsServerRunning = False
  If fso.FileExists(pidFile) Then
    Dim f, existingPid
    Set f = fso.OpenTextFile(pidFile, 1)
    If Not f.AtEndOfStream Then existingPid = Trim(f.ReadLine())
    f.Close
    If Len(existingPid) > 0 Then
      Dim procs
      Set procs = wmiSvc.ExecQuery( _
        "SELECT ProcessId FROM Win32_Process WHERE ProcessId = " & existingPid & " AND Name = 'node.exe'")
      If procs.Count > 0 Then IsServerRunning = True
    End If
  End If
End Function

Sub StartServerHidden(nodeExe, serverJs, workDir, pidFile)
  ' OBS: Win32_Process.Create ärver INTE tillförlitligt den anropande
  ' processens (cscript.exe) miljövariabler, trots vad vissa källor påstår —
  ' verifierat i praktiken att PORT/DATABASE_URL annars ignoreras och Node
  ' faller tillbaka på sina standardvärden. Miljön måste skickas explicit via
  ' Win32_ProcessStartup.EnvironmentVariables.
  Dim startup, processClass, pidOut, cmdLine, result
  Set startup = wmiSvc.Get("Win32_ProcessStartup").SpawnInstance_
  startup.ShowWindow = 0 ' SW_HIDE
  startup.EnvironmentVariables = CurrentEnvironmentArray()

  Set processClass = wmiSvc.Get("Win32_Process")
  cmdLine = """" & nodeExe & """ """ & serverJs & """"
  result = processClass.Create(cmdLine, workDir, startup, pidOut)

  If result = 0 Then
    Dim f
    Set f = fso.CreateTextFile(pidFile, True)
    f.WriteLine(pidOut)
    f.Close
  Else
    MsgBox "Kunde inte starta e-Machines-servern (felkod " & result & ")."
    WScript.Quit 1
  End If
End Sub

Function WaitForServer(url, timeoutSeconds)
  Dim elapsed
  elapsed = 0
  Do
    WaitForServer = IsServerUp(url)
    If WaitForServer Then Exit Function
    WScript.Sleep 500
    elapsed = elapsed + 0.5
  Loop While elapsed < timeoutSeconds
End Function

Function IsServerUp(url)
  On Error Resume Next
  Dim http
  IsServerUp = False
  Set http = CreateObject("WinHttp.WinHttpRequest.5.1")
  http.Open "GET", url, False
  http.Send
  If Err.Number = 0 And http.Status >= 200 And http.Status < 500 Then IsServerUp = True
  On Error Goto 0
End Function
