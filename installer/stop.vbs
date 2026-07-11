Option Explicit

' Avslutar den körande e-Machines-servern via PID-filen som launcher.vbs
' skrev. Säkert att köra även om servern redan är stoppad.

Dim fso, shell, installDir, pidFile

Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

installDir = fso.GetParentFolderName(WScript.ScriptFullName)
pidFile = installDir & "\run\server.pid"

If fso.FileExists(pidFile) Then
  Dim f, pid
  Set f = fso.OpenTextFile(pidFile, 1)
  If Not f.AtEndOfStream Then pid = Trim(f.ReadLine())
  f.Close

  If Len(pid) > 0 Then
    shell.Run "taskkill /PID " & pid & " /F /T", 0, True
  End If

  fso.DeleteFile pidFile, True
End If

MsgBox "e-Machines har stoppats."
