// Fill out your copyright notice in the Description page of Project Settings.

#include "TimestampBFL.h"
#include <chrono>
#include "Json.h"
#include "QARecorder.h"

void UTimestampBFL::GetSystemTime(FTimestamp& timestamp)
{
	timestamp.timestampInMs = UTimestampBFL::GetSystemTime();
}

int64 UTimestampBFL::GetSystemTime()
{
	return std::chrono::duration_cast<std::chrono::milliseconds>(
		std::chrono::system_clock::now().time_since_epoch()
	).count();
}

void UTimestampBFL::MakeBookmark(FTimestamp timestampSystemStart, FGameplayBookmark& bookmark)
{
	bookmark = FGameplayBookmark();
	FTimestamp timestampOffset;
	UTimestampBFL::GetBookmarkSystemTimeOffset(timestampSystemStart, timestampOffset);
	bookmark.timestampInMs = UTimestampBFL::GetSystemTime() - timestampSystemStart.timestampInMs + timestampOffset.timestampInMs;
}

void UTimestampBFL::SaveBookmarks(TArray<FGameplayBookmark> bookmarks)
{
	FString filePath;
	UTimestampBFL::GetBookmarkOutputFilePath(filePath);

	FString str;
	TSharedRef<TJsonWriter<TCHAR>> writer = TJsonWriterFactory<TCHAR>::Create(&str);
	writer->WriteArrayStart();
	for (FGameplayBookmark& bookmark : bookmarks)
	{
		writer->WriteObjectStart();
		writer->WriteValue("start", bookmark.timestampInMs - 1000);
		writer->WriteValue("end", bookmark.timestampInMs);
		writer->WriteValue("comment", bookmark.comment);
		writer->WriteObjectEnd();
	}
	writer->WriteArrayEnd();
	writer->Close();

	if (FFileHelper::SaveStringToFile(str, *filePath))
	{
		UE_LOG(LogQARecorder, Log, TEXT("Bookmarks successfully saved to %s"), *filePath);
	}
	else
	{
		UE_LOG(LogQARecorder, Log, TEXT("Bookmarks failed to save to %s"), *filePath);
	}
}

bool UTimestampBFL::GetCommandLineArgStrDefault(FString key, FString defaultValue, FString& value)
{
	value = defaultValue;
	bool hasValue = FParse::Value(FCommandLine::Get(), *key, value);
	if (hasValue)
	{
		value = value.Replace(TEXT("="), TEXT(""));
		if (value.StartsWith("\""))
		{
			value.RemoveAt(0);
			if (value.EndsWith("\""))
				value.RemoveAt(value.Len() - 1);
		}
	}
	return hasValue;
}

bool UTimestampBFL::GetCommandLineArgBoolDefault(FString key, bool defaultValue, bool& value)
{
	value = false;
	FString str;
	if (UTimestampBFL::GetCommandLineArgStrDefault(key, defaultValue ? "true" : "false", str))
	{
		value = str.ToBool();
		return true;
	}
	return false;
}

bool UTimestampBFL::GetCommandLineArgIntDefault(FString key, int32 defaultValue, int32& value)
{
	value = 0;
	FString str;
	if (UTimestampBFL::GetCommandLineArgStrDefault(key, FString::FromInt(defaultValue), str))
	{
		value = FCString::Atoi(*str);
		return true;
	}
	return false;
}

void UTimestampBFL::GetBookmarkOutputFilePath(FString& value)
{
	value = FPaths::Combine(FPaths::RootDir(), TEXT("Bookmarks.json"));
	UTimestampBFL::GetCommandLineArgStrDefault(
		"BookmarkOutputFile",
		value, value
	);
}

void UTimestampBFL::GetBookmarkSystemTimeOffset(FTimestamp systemStart, FTimestamp& offset)
{
	int32 cmdArg = 0;
	UTimestampBFL::GetCommandLineArgIntDefault(
		"BookmarkOffsetStartTime", 0, cmdArg
	);
	offset.timestampInMs = cmdArg;
	if (offset.timestampInMs > 0)
	{
		// subtract the starting system time
		// b/c the offset in command line is the start time that the recording started at
		offset.timestampInMs = offset.timestampInMs - systemStart.timestampInMs;
	}
}
